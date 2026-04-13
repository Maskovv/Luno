import { useState } from 'react'
import { game1EmailHotspots } from './level2FlowData'
import './level2.css'

export function Game1PhishingEmail({ onComplete }) {
  const [found, setFound] = useState(new Set())
  const [msg, setMsg] = useState('')

  const click = (id) => {
    if (found.has(id)) return
    const s = game1EmailHotspots.find((x) => x.id === id)
    setFound((f) => new Set([...f, id]))
    setMsg(s?.luno || '')
  }

  const done = found.size === game1EmailHotspots.length

  return (
    <div className="l2-card">
      <h2 className="l2-title">Игра 1: Распознай фишинговое письмо</h2>
      <p className="l2-sub">
        Нажми на подозрительные фрагменты письма (отправитель, ссылка, слова, просьбы). Нужно найти все признаки ({game1EmailHotspots.length}).
      </p>

      <div className="l2-email">
        <div className="l2-email-head">
          <div>
            От:{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('from') ? 'l2-found' : ''}`}
              onClick={() => click('from')}
            >
              support@security-mail.com
            </button>
          </div>
          <div>
            Тема:{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('subject') ? 'l2-found' : ''}`}
              onClick={() => click('subject')}
            >
              Срочно! Аккаунт будет заблокирован
            </button>
          </div>
        </div>

        <div className="l2-email-body">
          <p>
            Здравствуйте,{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('generic') ? 'l2-found' : ''}`}
              onClick={() => click('generic')}
            >
              пользователь
            </button>
            !
          </p>
          <p>
            Мы заметили подозрительную активность.{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('urgent') ? 'l2-found' : ''}`}
              onClick={() => click('urgent')}
            >
              Срочно подтвердите
            </button>{" "}
            данные, иначе доступ будет ограничен.
          </p>
          <p>
            Перейдите по ссылке и войдите в аккаунт:{" "}
            <button
              type="button"
              className={`l2-hot ${found.has('link') ? 'l2-found' : ''}`}
              onClick={() => click('link')}
            >
              http://curs-8f6bc.web.app.verify-login.ru
            </button>
          </p>
          <p>
            Для подтверждения попросим вас{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('ask') ? 'l2-found' : ''}`}
              onClick={() => click('ask')}
            >
              отправить пароль
            </button>{" "}
            в ответ на это письмо.
          </p>
          <p>
            Спасибо!{" "}
            <button
              type="button"
              className={`l2-hot-inline ${found.has('typos') ? 'l2-found' : ''}`}
              onClick={() => click('typos')}
            >
              Администрацыя службы подержки
            </button>
          </p>
        </div>
      </div>

      {msg && (
        <div className="l2-luno">
          <strong>Луно:</strong> {msg}
        </div>
      )}

      <p className="l2-progress">
        Найдено: {found.size} / {game1EmailHotspots.length}
      </p>

      {done && (
        <div className="l2-win">
          <p>Отлично! Ты заметил признаки фишинга в письме.</p>
          <button type="button" className="l2-primary" onClick={onComplete}>
            Продолжить
          </button>
        </div>
      )}
    </div>
  )
}

