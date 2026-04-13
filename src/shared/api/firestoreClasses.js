import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

function safeRandomId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `c_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
  }
}

export async function createClassSession({ teacherUid }) {
  const classId = safeRandomId()
  await setDoc(doc(db, 'classes', classId), {
    teacherUid,
    active: true,
    createdAt: serverTimestamp(),
  })
  return classId
}

export async function getClassTeacherUid(classId) {
  if (!classId) return null
  const snap = await getDoc(doc(db, 'classes', classId))
  if (!snap.exists()) return null
  const data = snap.data()
  return data?.teacherUid || null
}

