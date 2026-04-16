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

/** Локальный резерв шага (устойчив к сбоям записи в Firestore / правилам). */
const LS_PREFIX = 'cyber_lvl_v1:'

function levelProgressLsKey(uid, levelId) {
  return `${LS_PREFIX}${uid}:${String(levelId)}`
}

export function readLevelProgressLocal(uid, levelId) {
  if (!uid || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(levelProgressLsKey(uid, levelId))
    if (!raw) return null
    const o = JSON.parse(raw)
    if (o && typeof o.step === 'number' && o.step >= 0) return o
  } catch {
    /* ignore */
  }
  return null
}

function writeLevelProgressLocal(uid, levelId, step) {
  if (!uid || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      levelProgressLsKey(uid, levelId),
      JSON.stringify({ step, updatedAt: Date.now() }),
    )
  } catch {
    /* quota / private mode */
  }
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

/**
 * Состояние уровня с учётом локального резерва: если в облаке шаг «отстаёт» или пусто — поднимаем и при возможности синхронизируем.
 */
export async function getLevelProgress(uid, levelId) {
  const remote = await getLevelState(uid, levelId)
  if (remote?.completed) return remote

  const local = readLevelProgressLocal(uid, levelId)
  if (!remote && !local) return null
  if (remote && !local) return remote
  if (!remote && local) {
    void setLevelStep(uid, levelId, local.step)
    return { step: local.step }
  }

  const rStep = Number(remote.step) || 0
  const lStep = Number(local.step) || 0
  if (lStep > rStep) {
    void setLevelStep(uid, levelId, lStep)
    return { ...remote, step: lStep }
  }
  return remote
}

export async function setLevelStep(uid, levelId, step) {
  writeLevelProgressLocal(uid, levelId, step)
  const ref = levelDoc(uid, levelId)
  try {
    await setDoc(
      ref,
      {
        step,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (e) {
    console.error('[progress] Firestore setLevelStep failed (шаг сохранён локально)', levelId, e)
  }
}

/**
 * Сохранить текущий шаг перед уходом со страницы уровня (меню «Назад»).
 * Ошибки сети логируются и не блокируют переход — иначе пользователь «теряет» сессию визуально.
 */
export async function flushLevelStepForExit(uid, levelId, step) {
  if (!uid) return
  await setLevelStep(uid, levelId, step)
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

