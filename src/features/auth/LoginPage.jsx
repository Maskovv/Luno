import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import './LoginPage.css'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const classId = searchParams.get('class')
    if (classId) {
      localStorage.setItem('pendingClassId', classId)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Введите email.')
      return
    }
    if (!password) {
      setError('Введите пароль.')
      return
    }
    if (mode === 'register' && password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, name.trim())
      }
      navigate('/levels')
    } catch (err) {
      setError(err?.message || 'Ошибка входа или регистрации.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
        <p>
          {mode === 'login'
            ? 'Введите email и пароль'
            : 'Создайте аккаунт для участия в игре'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="login-input"
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="login-input"
            disabled={loading}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {mode === 'register' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя (как к вам обращаться)"
              className="login-input"
              disabled={loading}
              autoComplete="name"
            />
          )}

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Проверка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button type="button" className="login-switch" onClick={switchMode}>
          {mode === 'login'
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  )
}
