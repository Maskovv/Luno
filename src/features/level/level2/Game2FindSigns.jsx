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
    <div className="l2-card">
      <h2 className="l2-title">Игра 2: Найди признаки фишинга на сайте</h2>
      <p className="l2-sub">
        Нажимай на элементы, которые кажутся подозрительными. Нужно найти все признаки ({game2Signs.length}).
      </p>

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

          <div className="l2-footer">
            <button
              type="button"
              className={`l2-hot-inline ${found.has('no_contacts') ? 'l2-found' : ''}`}
              onClick={() => click('no_contacts')}
            >
              Контакты отсутствуют
            </button>
            <button
              type="button"
              className={`l2-hot-inline ${found.has('popup') ? 'l2-found' : ''}`}
              onClick={() => setPopupOpen(true)}
            >
              Реклама / всплывающее окно
            </button>
          </div>
        </div>
      </div>

      {popupOpen && (
        <div className="l2-modal-backdrop" role="presentation" onClick={() => setPopupOpen(false)}>
          <div className="l2-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
        <LunoVictoryScreen title="Отлично!" onContinue={onComplete} continueLabel="Вперёд">
          <p>Ты нашёл все признаки небезопасного сайта.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}

