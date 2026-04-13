import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'

function userDoc(uid) {
  return doc(db, 'users', uid)
}

function levelDoc(uid, levelId) {
  return doc(db, 'users', uid, 'levels', String(levelId))
}

export async function ensureUserProfile({ uid, email, displayName }) {
  const ref = userDoc(uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email || null,
      displayName: displayName || null,
      teacherUid: null,
      classId: null,
      unlockedLevels: [1],
      completedLevels: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { unlockedLevels: [1] }
  }
  const data = snap.data()
  // обновляем displayName/email, если они появились позже
  const patch = {}
  if (email && !data.email) patch.email = email
  if (displayName && !data.displayName) patch.displayName = displayName
  if (Object.keys(patch).length) {
    await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
  }
  return { ...data, ...patch }
}

export async function attachStudentToClass({ uid, teacherUid, classId }) {
  if (!uid || !teacherUid || !classId) return
  await setDoc(
    userDoc(uid),
    {
      teacherUid,
      classId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getUnlockedLevels(uid) {
  const snap = await getDoc(userDoc(uid))
  if (!snap.exists()) return [1]
  const data = snap.data()
  return Array.isArray(data.unlockedLevels) && data.unlockedLevels.length > 0
    ? data.unlockedLevels
    : [1]
}

export async function unlockNextLevel(uid, nextLevel) {
  const ref = userDoc(uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { unlockedLevels: [1, nextLevel], updatedAt: serverTimestamp() })
    return
  }
  const data = snap.data()
  const current = Array.isArray(data.unlockedLevels) ? data.unlockedLevels : [1]
  if (current.includes(nextLevel)) return
  await updateDoc(ref, {
    unlockedLevels: [...current, nextLevel].sort((a, b) => a - b),
    updatedAt: serverTimestamp(),
  })
}

export async function getLevelState(uid, levelId) {
  const snap = await getDoc(levelDoc(uid, levelId))
  if (!snap.exists()) return null
  return snap.data()
}

export async function setLevelStep(uid, levelId, step) {
  const ref = levelDoc(uid, levelId)
  await setDoc(
    ref,
    {
      step,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function completeLevel(uid, levelId) {
  const ref = levelDoc(uid, levelId)
  await setDoc(
    ref,
    {
      completed: true,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  // Агрегируем "лучшую попытку" в профиле пользователя:
  // - completedLevels[levelId] = true
  // - bestCompletedAt[levelId] фиксируем один раз (первое/лучшее завершение)
  // - lastCompletedAt[levelId] обновляем каждый раз
  await runTransaction(db, async (tx) => {
    const uref = userDoc(uid)
    const snap = await tx.get(uref)
    if (!snap.exists()) return
    const data = snap.data() || {}
    const best = data.bestCompletedAt || {}
    const lvl = String(levelId)

    const patch = {
      [`completedLevels.${lvl}`]: true,
      [`lastCompletedAt.${lvl}`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    if (!best[lvl]) {
      patch[`bestCompletedAt.${lvl}`] = serverTimestamp()
    }
    tx.update(uref, patch)
  })
}

export async function getUsersForTeacherStats(teacherUid) {
  const q = query(collection(db, 'users'), where('teacherUid', '==', teacherUid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}

