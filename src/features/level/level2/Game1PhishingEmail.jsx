import { useState } from 'react'
import { RichText } from '../../../shared/components/RichText'
import { game1EmailHotspots } from './level2FlowData'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

export function Game1PhishingEmail({ onComplete, lunoAvatarUrls }) {
  const [found, setFound] = useState(new Set())
  const [msg, setMsg] = useState('')
  const [decoys, setDecoys] = useState(new Set())

  const click = (id) => {
    const hotspot = game1EmailHotspots.find((x) => x.id === id)
    if (!hotspot) {
      if (decoys.has(id)) return
      setDecoys((d) => new Set([...d, id]))
      setMsg('Это нейтральная фраза: сама по себе она не доказывает фишинг. Ищи более явные признаки.')
      return
    }
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

      <div className="l2-mail-shell" aria-hidden="false">
        <div className="l2-mail-chrome">
          <div className="l2-mail-dots" aria-hidden>
            <span className="l2-mail-dot l2-mail-dot--r" />
            <span className="l2-mail-dot l2-mail-dot--y" />
            <span className="l2-mail-dot l2-mail-dot--g" />
          </div>
          <span className="l2-mail-chrome-title">Почта — Входящие</span>
        </div>
        <div className="l2-mail-toolbar">
          <span className="l2-mail-toolbar-pill">Написать</span>
          <button
            type="button"
            className={`l2-hot-inline ${decoys.has('toolbar_inbox') ? 'l2-found' : ''}`}
            onClick={() => click('toolbar_inbox')}
          >
            Входящие
          </button>
          <span className="l2-mail-toolbar-muted">Отправленные</span>
          <span className="l2-mail-toolbar-muted">Спам</span>
        </div>
        <div className="l2-mail-main">
          <aside className="l2-mail-aside">
            <div className="l2-mail-aside-row l2-mail-aside-row--active">
              <span className="l2-mail-aside-dot" />
              <button
                type="button"
                className={`l2-hot-inline ${decoys.has('aside_security') ? 'l2-found' : ''}`}
                onClick={() => click('aside_security')}
              >
                Служба безопасности
              </button>
            </div>
            <div className="l2-mail-aside-row">
              <span className="l2-mail-aside-dot l2-mail-aside-dot--dim" />
              <button
                type="button"
                className={`l2-hot-inline ${decoys.has('aside_newsletter') ? 'l2-found' : ''}`}
                onClick={() => click('aside_newsletter')}
              >
                Рассылка курса
              </button>
            </div>
            <div className="l2-mail-aside-row">
              <span className="l2-mail-aside-dot l2-mail-aside-dot--dim" />
              Уведомления
            </div>
          </aside>
          <div className="l2-email">
            <div className="l2-email-meta">
              <div className="l2-email-avatar" aria-hidden>
                SB
              </div>
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
                <p className="l2-email-attach-label">Вложение (не открывать):</p>
                <div className="l2-email-attach">
                  <span className="l2-email-attach-ico" aria-hidden>
                    📄
                  </span>
                  <div className="l2-email-attach-meta">
                    <span className="l2-email-attach-name">invoice__prize.scr</span>
                    <span className="l2-email-attach-size">28 КБ</span>
                  </div>
                </div>
              </div>
            </div>

        <div className="l2-email-letter">
        <div className="l2-email-body">
          <p>
            <button
              type="button"
              className={`l2-hot-inline ${decoys.has('greeting') ? 'l2-found' : ''}`}
              onClick={() => click('greeting')}
            >
              Здравствуйте
            </button>
            ,{" "}
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
            <button
              type="button"
              className={`l2-hot-inline ${decoys.has('neutral_intro') ? 'l2-found' : ''}`}
              onClick={() => click('neutral_intro')}
            >
              Мы заметили
            </button>{' '}
            подозрительную активность.{" "}
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
            <button
              type="button"
              className={`l2-hot-inline ${decoys.has('thanks') ? 'l2-found' : ''}`}
              onClick={() => click('thanks')}
            >
              Спасибо
            </button>
            !{" "}
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
          </div>
        </div>
      </div>

      {msg && (
        <div className="l2-luno">
          <div className="l2-luno-photo" aria-hidden>
            <LunoPhoto urls={lunoAvatarUrls} className="l2-luno-img" alt="" />
          </div>
          <p className="l2-luno-text">
            <strong>Луно:</strong> <RichText>{msg}</RichText>
          </p>
        </div>
      )}

      <p className="l2-progress">
        Найдено: {found.size} / {game1EmailHotspots.length}
      </p>

      {done && (
        <LunoVictoryScreen
          title="Отлично!"
          onContinue={onComplete}
          continueLabel="Вперёд"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>
            <RichText>Ты заметил **признаки фишинга** в письме.</RichText>
          </p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}

