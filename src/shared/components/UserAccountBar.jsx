import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import './UserAccountBar.css'

/**
 * @param {{ tone?: 'light' | 'dark' }} props
 * light — текст/кнопка на градиентном фоне; dark — на светлой карточке
 */
export function UserAccountBar({ tone = 'light' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (e) {
      console.error(e)
    }
  }

  if (!user) return null

  const email = user.email || user.uid
  const short =
    email.length > 28 ? `${email.slice(0, 14)}…${email.slice(-10)}` : email

  return (
    <div className={`user-account-bar user-account-bar--${tone}`}>
      <span className="user-account-bar-email" title={email}>
        {short}
      </span>
      <button type="button" className="user-account-bar-logout" onClick={handleLogout}>
        Выйти из аккаунта
      </button>
    </div>
  )
}
