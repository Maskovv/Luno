import { useEffect, useState } from 'react'
import { game2Signs } from './level2FlowData'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

const POPUP_AUTO_MS = 1100
const POPUP_WRONG =
  'Так делать не стоит: на подозрительных окнах не нажимай «Получить приз». Закрой окно кнопкой «Закрыть».'

export function Game2FindSigns({ onComplete, lunoAvatarUrls }) {
  const [found, setFound] = useState(new Set())
  const [msg, setMsg] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPopupOpen(true), POPUP_AUTO_MS)
    return () => clearTimeout(t)
  }, [])

  const click = (id) => {
    if (found.has(id)) return
    const s = game2Signs.find((x) => x.id === id)
    setFound((f) => new Set([...f, id]))
    setMsg(s?.luno || '')
  }

  const done = found.size === game2Signs.length

  return (
    <div className="l2-card">
      <h2 className="l2-title">Игра 2: Найди признаки фишинга на сайте</h2>
      <p className="l2-sub">
        Нажимай на элементы страницы, которые кажутся подозрительными. Рекламное окно появится само — признак
        «всплывающее окно» засчитается, если закроешь его кнопкой «Закрыть» (всего признаков: {game2Signs.length}).
      </p>

      <div className="l2-browser-shell">
        <div className="l2-browser-tabs" aria-hidden>
          <span className="l2-browser-tab l2-browser-tab--active">Оплата призов</span>
          <span className="l2-browser-tab">Новая вкладка</span>
        </div>
        <div className="l2-site">
        <div className="l2-site-bar">
          <div className="l2-addr">
            <span className="l2-addr-dot l2-dot-red" />
            <span className="l2-addr-dot l2-dot-yellow" />
            <span className="l2-addr-dot l2-dot-green" />
            <button
              type="button"
              className={`l2-hot ${found.has('weird_url') ? 'l2-found' : ''}`}
              onClick={() => click('weird_url')}
            >
              http://pay-0nline-bonus.ru/login
            </button>
          </div>
          <button
            type="button"
            className={`l2-hot l2-lock ${found.has('no_https') ? 'l2-found' : ''}`}
            onClick={() => click('no_https')}
            title="Проверь протокол"
          >
            Нет 🔓
          </button>
        </div>

        <div className="l2-site-body">
          <div className="l2-site-hero" aria-hidden>
            <div className="l2-site-hero-inner">
              <span className="l2-site-hero-badge">Акция</span>
              <span className="l2-site-hero-title">Мгновенный приз</span>
            </div>
          </div>
          <h3>Вы выиграли приз! Заберите прямо сейчас</h3>
          <p>
            <button
              type="button"
              className={`l2-hot-inline ${found.has('typos') ? 'l2-found' : ''}`}
              onClick={() => click('typos')}
            >
              Для полученния призы
            </button>{' '}
            заполните форму ниже.
          </p>

          <div className="l2-form">
            <label>
              Логин
              <input disabled placeholder="Введите логин" />
            </label>
            <label>
              Пароль
              <button
                type="button"
                className={`l2-hot-inline ${found.has('ask_password') ? 'l2-found' : ''}`}
                onClick={() => click('ask_password')}
              >
                (сайт просит пароль)
              </button>
              <input disabled placeholder="Введите пароль" />
            </label>
            <button
              type="button"
              className={`l2-hot l2-popup ${found.has('urgent') ? 'l2-found' : ''}`}
              onClick={() => click('urgent')}
            >
              СРОЧНО подтвердите, иначе приз сгорит!
            </button>
          </div>
        </div>
        </div>
      </div>

      {popupOpen && (
        <div className="l2-modal-backdrop" role="presentation">
          <div className="l2-modal l2-modal--enter" role="dialog" aria-modal="true" aria-labelledby="l2-popup-title">
            <div className="l2-modal-title" id="l2-popup-title">
              Поздравляем!
            </div>
            <div className="l2-modal-body">
              Вы выиграли приз. Нажмите кнопку ниже, чтобы получить его прямо сейчас.
            </div>
            <div className="l2-modal-actions">
              <button
                type="button"
                className="l2-bad"
                onClick={() => setMsg(POPUP_WRONG)}
              >
                Получить приз
              </button>
              <button
                type="button"
                className="l2-good"
                onClick={() => {
                  click('popup')
                  setPopupOpen(false)
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="l2-luno">
          <div className="l2-luno-photo" aria-hidden>
            <LunoPhoto urls={lunoAvatarUrls} className="l2-luno-img" alt="" />
          </div>
          <p className="l2-luno-text">
            <strong>Луно:</strong> {msg}
          </p>
        </div>
      )}

      <p className="l2-progress">
        Найдено: {found.size} / {game2Signs.length}
      </p>

      {done && (
        <LunoVictoryScreen
          title="Отлично!"
          onContinue={onComplete}
          continueLabel="Вперёд"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>Ты нашёл все признаки небезопасного сайта.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}

