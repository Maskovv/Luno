import { useState } from 'react'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level1.css'

const OPTIONS = [
  { id: 'sms', label: 'SMS', icon: '💬' },
  { id: 'push', label: 'Пуш-уведомление', icon: '🔔' },
  { id: 'email', label: 'Электронная почта', icon: '✉️' },
]

export function Game5TwoFactor({ onComplete }) {
  const [method, setMethod] = useState(null)
  const [phase, setPhase] = useState('choose')
  const [typedCode, setTypedCode] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const verifyCode = '1468'

  const startVerify = () => {
    if (!method) return
    setPhase('sent')
    setTypedCode('')
    setErr('')
  }

  const addDigit = (digit) => {
    if (typedCode.length >= 4) return
    setTypedCode((v) => `${v}${digit}`)
    if (err) setErr('')
  }

  const removeDigit = () => {
    setTypedCode((v) => v.slice(0, -1))
    if (err) setErr('')
  }

  const submitCode = () => {
    if (typedCode === verifyCode) {
      setOk(true)
      return
    }
    setErr('Неверный код. Проверь цифры и попробуй снова.')
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
        Выбери способ получения кода, введи проверочный код и заверши вход.
      </p>

      <div className="l1-2fa-window">
        <div className="l1-2fa-titlebar">
          <div className="l1-social-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span>Вход в аккаунт</span>
        </div>
        <div className="l1-2fa-body">
          <div className="l1-2fa-heading">БЕЗОПАСНЫЙ ВХОД</div>
          {phase === 'choose' && (
            <>
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
              <button type="button" className="l1-2fa-login-btn" onClick={startVerify} disabled={!method}>
                Получить код
              </button>
            </>
          )}

          {phase === 'sent' && (
            <div className="l1-2fa-verify">
              <p className="l1-2fa-method-note">
                Код отправлен через: <strong>{OPTIONS.find((o) => o.id === method)?.label}</strong>
              </p>
              <div className="l1-2fa-arrival">
                <div className="l1-2fa-arrival-title">Пришло сообщение с кодом:</div>
                <div className="l1-2fa-arrival-code">{verifyCode}</div>
              </div>
              <button type="button" className="l1-2fa-login-btn" onClick={() => setPhase('verify')}>
                Ввести код
              </button>
            </div>
          )}

          {phase === 'verify' && (
            <div className="l1-2fa-verify">
              <p className="l1-2fa-method-note">
                Код отправлен через: <strong>{OPTIONS.find((o) => o.id === method)?.label}</strong>
              </p>
              <div className="l1-2fa-arrival l1-2fa-arrival--small">
                Код из сообщения: <strong>{verifyCode}</strong>
              </div>
              <div className="l1-2fa-code-display">{typedCode || '____'}</div>
              <div className="l1-2fa-keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button key={n} type="button" className="l1-2fa-key" onClick={() => addDigit(n)}>
                    {n}
                  </button>
                ))}
                <button type="button" className="l1-2fa-key l1-2fa-key-back" onClick={removeDigit}>
                  ←
                </button>
                <button type="button" className="l1-2fa-key" onClick={() => addDigit(0)}>
                  0
                </button>
                <button type="button" className="l1-2fa-key l1-2fa-key-enter" onClick={submitCode}>
                  ↵
                </button>
              </div>
              {err && <p className="l1-feedback-bad">{err}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
