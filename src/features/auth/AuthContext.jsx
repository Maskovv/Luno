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

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const withRetries = async (fn, attempts = 3, delayMs = 700) => {
    let lastError = null
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await fn()
      } catch (e) {
        lastError = e
        if (i < attempts - 1) await sleep(delayMs)
      }
    }
    throw lastError || new Error('retry_failed')
  }

  const syncUserProfileAndClass = async (authUser) => {
    if (!authUser) return
    await withTimeout(
      ensureUserProfile({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      }),
      5000,
    )

    const pendingClassId = localStorage.getItem('pendingClassId')
    if (!pendingClassId) return

    const teacherUid = await withRetries(
      () => withTimeout(getClassTeacherUid(pendingClassId), 12000),
      3,
      900,
    )
    if (!teacherUid) return

    await withRetries(
      () =>
        withTimeout(
          attachStudentToClass({
            uid: authUser.uid,
            teacherUid,
            classId: pendingClassId,
          }),
          12000,
        ),
      3,
      900,
    )
    localStorage.removeItem('pendingClassId')
  }

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
            await syncUserProfileAndClass(user)
          } catch (e) {
            console.error('[auth] syncUserProfileAndClass failed', e)
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
      try {
        await syncUserProfileAndClass(userCredential.user)
      } catch (e) {
        console.error('[auth] login syncUserProfileAndClass failed', e)
      }
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
      try {
        await syncUserProfileAndClass({
          ...userCredential.user,
          displayName: displayName?.trim() || userCredential.user.displayName,
        })
      } catch (e) {
        console.error('[auth] register syncUserProfileAndClass failed', e)
      }
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
