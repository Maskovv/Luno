import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export async function isTeacher(uid) {
  if (!uid) return false
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return false
  const data = snap.data()
  return data?.role === 'teacher'
}

// Опционально: удобный хелпер, если вы хотите создать запись вручную из консоли.
export async function markTeacher(uid) {
  if (!uid) return
  await setDoc(
    doc(db, 'users', uid),
    { role: 'teacher', updatedAt: serverTimestamp() },
    { merge: true },
  )
}

