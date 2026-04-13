import { useState } from 'react'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level1.css'

const OPTIONS = [
  { id: 'sms', label: 'SMS', icon: '💬' },
  { id: 'push', label: 'Пуш уведомление', icon: '🔔' },
  { id: 'email', label: 'Электронная почта', icon: '✉️' },
]

export function Game5TwoFactor({ onComplete }) {
  const [method, setMethod] = useState(null)
  const [ok, setOk] = useState(false)

  const login = () => {
    if (method) setOk(true)
  }

  if (ok) {
    return (
      <LunoVictoryScreen title="Готово!" onContinue={onComplete} continueLabel="Вперёд">
        <p>
          <strong>Луно:</strong> Молодец! Ты включил безопасный вход с подтверждением. Даже если кто-то узнает
          пароль, без кода на твоё устройство или почту войти не получится.
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l1-game">
      <h2>Игра 5: Безопасный вход</h2>
      <p className="l1-hint l1-hint-spoiler-free">
        Найди блок «Безопасный вход», выбери, куда прислать проверочный код, и нажми «Войти».
      </p>

      <div className="l1-2fa-window l1-2fa-window--mock">
        <div className="l1-2fa-titlebar">
          <div className="l1-social-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className="l1-2fa-titlebar-label">Окно входа</span>
        </div>
        <div className="l1-2fa-body">
          <div className="l1-2fa-heading">БЕЗОПАСНЫЙ ВХОД</div>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`l1-2fa-option ${method === o.id ? 'l1-2fa-option-on' : ''}`}
              onClick={() => setMethod(o.id)}
            >
              <span className="l1-2fa-option-icon" aria-hidden>
                {o.icon}
              </span>
              <span>{o.label}</span>
            </button>
          ))}
          <button type="button" className="l1-2fa-login-btn" onClick={login} disabled={!method}>
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}
