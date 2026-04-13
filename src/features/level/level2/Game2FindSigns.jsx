import { useState } from 'react'
import { game2Signs } from './level2FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

export function Game2FindSigns({ onComplete }) {
  const [found, setFound] = useState(new Set())
  const [msg, setMsg] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)

  const click = (id) => {
    if (found.has(id)) return
    const s = game2Signs.find((x) => x.id === id)
    setFound((f) => new Set([...f, id]))
    setMsg(s?.luno || '')
  }

  const done = found.size === game2Signs.length

  return (
    <div className="l2-card l2-game2-root">
      <h2 className="l2-title">Игра 2: Найди признаки фишинга на сайте</h2>
      <p className="l2-sub">
        Это учебная страница. Нажимай на элементы, которые кажутся подозрительными. Нужно найти все признаки (
        {game2Signs.length}).
      </p>

      <div className="l2-epic-shell">
        <div className="l2-epic-glow" aria-hidden />
        <div className="l2-epic-window">
          <div className="l2-epic-chrome">
            <div className="l2-epic-traffic">
              <span />
              <span />
              <span />
            </div>
            <div className="l2-epic-chrome-title">Браузер · подозрительная вкладка</div>
            <div className="l2-epic-chrome-spacer" />
          </div>

          <div className="l2-epic-toolbar">
            <div className="l2-epic-addr-wrap">
              <button
                type="button"
                className={`l2-epic-url ${found.has('weird_url') ? 'l2-found' : ''}`}
                onClick={() => click('weird_url')}
              >
                http://pay-0nline-bonus.ru/login
              </button>
            </div>
            <button
              type="button"
              className={`l2-epic-secure ${found.has('no_https') ? 'l2-found' : ''}`}
              onClick={() => click('no_https')}
            >
              Небезопасно · нет 🔒
            </button>
          </div>

          <div className="l2-epic-body">
            <div className="l2-epic-hero">
              <div className="l2-epic-ribbon">FAKE</div>
              <div className="l2-epic-hero-inner">
                <div className="l2-epic-cup">🏆</div>
                <h3 className="l2-epic-h3">Вы выиграли приз!</h3>
                <p className="l2-epic-flash">Заберите прямо сейчас — предложение сгорает через минуту</p>
              </div>
            </div>

            <div className="l2-epic-card">
              <p className="l2-epic-lead">
                <button
                  type="button"
                  className={`l2-hot-inline l2-epic-inline ${found.has('typos') ? 'l2-found' : ''}`}
                  onClick={() => click('typos')}
                >
                  Для полученния призы
                </button>{' '}
                заполните форму ниже. Это займёт одну минуту.
              </p>

              <div className="l2-epic-form">
                <label className="l2-epic-field">
                  <span>Логин</span>
                  <input disabled placeholder="Введите логин" />
                </label>
                <label className="l2-epic-field">
                  <span>
                    Пароль ·{' '}
                    <button
                      type="button"
                      className={`l2-hot-inline ${found.has('ask_password') ? 'l2-found' : ''}`}
                      onClick={() => click('ask_password')}
                    >
                      сайт требует пароль без объяснения
                    </button>
                  </span>
                  <input disabled placeholder="••••••••" />
                </label>
                <button
                  type="button"
                  className={`l2-epic-cta ${found.has('urgent') ? 'l2-found' : ''}`}
                  onClick={() => click('urgent')}
                >
                  СРОЧНО подтвердите, иначе приз сгорит!
                </button>
              </div>
            </div>

            <div className="l2-epic-footer">
              <button
                type="button"
                className={`l2-epic-footlink ${found.has('no_contacts') ? 'l2-found' : ''}`}
                onClick={() => click('no_contacts')}
              >
                Контакты отсутствуют
              </button>
              <button type="button" className="l2-epic-footad" onClick={() => setPopupOpen(true)}>
                Реклама · всплывающее окно
              </button>
            </div>
          </div>
        </div>
      </div>

      {popupOpen && (
        <div className="l2-modal-backdrop" role="presentation" onClick={() => setPopupOpen(false)}>
          <div className="l2-modal l2-modal-epic" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="l2-modal-title">Поздравляем!</div>
            <div className="l2-modal-body">
              Вы выиграли приз. Нажмите кнопку ниже, чтобы получить его прямо сейчас.
            </div>
            <div className="l2-modal-actions">
              <button
                type="button"
                className="l2-bad"
                onClick={() => {
                  click('popup')
                  setPopupOpen(false)
                }}
              >
                Получить приз
              </button>
              <button type="button" className="l2-good" onClick={() => setPopupOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="l2-luno">
          <strong>Луно:</strong> {msg}
        </div>
      )}

      <p className="l2-progress">
        Найдено: {found.size} / {game2Signs.length}
      </p>

      {done && (
        <LunoVictoryScreen title="Супер!" onContinue={onComplete} continueLabel="Вперёд">
          <p>Отлично! Ты нашёл все признаки небезопасного сайта.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
