import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../../shared/config/firebase'
import { attachStudentToClass, ensureUserProfile } from '../../shared/api/firestoreProgress'
import { getClassTeacherUid } from '../../shared/api/firestoreClasses'
import { isTeacher as isTeacherInDb } from '../../shared/api/firestoreRoles'

const AuthContext = createContext(null)

// Перевод ошибок Firebase на русский
function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован.',
    'auth/invalid-email': 'Некорректный email.',
    'auth/operation-not-allowed': 'Метод входа отключён. Включите в Firebase: Authentication → Методы входа.',
    'auth/weak-password': 'Пароль должен быть не короче 6 символов.',
    'auth/user-disabled': 'Этот аккаунт заблокирован.',
    'auth/user-not-found': 'Пользователь не найден.',
    'auth/wrong-password': 'Неверный пароль.',
    'auth/invalid-credential': 'Неверный email или пароль.',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
  }
  return messages[code] || 'Произошла ошибка. Попробуйте ещё раз.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      setUser(user)
      setIsTeacher(false)
      setRoleLoading(false)
      if (user) {
        setRoleLoading(true)
        // ВАЖНО: ничего не блокируем — всё делаем в фоне
        ;(async () => {
          try {
            await withTimeout(
              ensureUserProfile({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
              }),
              5000,
            )
          } catch (e) {
            console.error(e)
          }

          // если ученик пришёл по QR (classId), привязываем к учителю
          const pendingClassId = localStorage.getItem('pendingClassId')
          if (pendingClassId) {
            try {
              const teacherUid = await withTimeout(getClassTeacherUid(pendingClassId), 5000)
              if (teacherUid) {
                await withTimeout(
                  attachStudentToClass({
                    uid: user.uid,
                    teacherUid,
                    classId: pendingClassId,
                  }),
                  5000,
                )
                localStorage.removeItem('pendingClassId')
              }
            } catch (e) {
              console.error(e)
            }
          }

          try {
            const t = await withTimeout(isTeacherInDb(user.uid), 5000)
            setIsTeacher(Boolean(t))
          } catch (e) {
            console.error(e)
            setIsTeacher(false)
          } finally {
            setRoleLoading(false)
          }
        })()
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // Не блокируем UI Firestore-операциями: onAuthStateChanged всё сделает.
      return userCredential.user
    } catch (error) {
      throw new Error(getAuthErrorMessage(error?.code))
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName?.trim()) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() })
      }
      // Не блокируем UI Firestore-операциями: onAuthStateChanged всё сделает.
      return userCredential.user
    } catch (error) {
      throw new Error(getAuthErrorMessage(error?.code))
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, roleLoading, isTeacher, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}
