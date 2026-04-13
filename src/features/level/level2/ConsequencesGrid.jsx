import { useState } from 'react'
import { consequencesCards } from './level2FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

const VISUAL_EMOJI = {
  key: '🔑',
  lock: '🔐',
  chat: '💬',
  leak: '📤',
  bug: '🐛',
  scan: '📡',
  money: '💳',
}

export function ConsequencesGrid({ onComplete }) {
  const [open, setOpen] = useState({})
  const [victory, setVictory] = useState(false)

  const openedCount = Object.values(open).filter(Boolean).length
  const done = openedCount === consequencesCards.length

  return (
    <div className="l2-card">
      <h2 className="l2-title">Что может случиться после фишинга?</h2>
      <p className="l2-sub">
        Нажми на каждую карточку, чтобы прочитать последствие. Открыто: {openedCount} / {consequencesCards.length}
      </p>
      <div className="l2-grid l2-cons-grid">
        {consequencesCards.map((c) => {
          const isOpen = !!open[c.id]
          return (
            <button
              key={c.id}
              type="button"
              className={`l2-cons l2-cons-with-visual ${isOpen ? 'l2-cons-open' : ''}`}
              onClick={() => setOpen((o) => ({ ...o, [c.id]: true }))}
            >
              <div className={`l2-cons-art l2-cons-art--${c.visual}`} aria-hidden>
                <span className="l2-cons-emoji">{VISUAL_EMOJI[c.visual] || '❗'}</span>
              </div>
              <div className="l2-cons-title">{c.title}</div>
              <div className="l2-cons-body">{isOpen ? c.text : 'Нажми, чтобы открыть'}</div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="l2-primary l2-cons-cta"
        disabled={!done}
        onClick={() => setVictory(true)}
      >
        Далее
      </button>
      {!done && (
        <p className="l2-cons-hint">Сначала открой все карточки — кнопка станет активной.</p>
      )}

      {victory && (
        <LunoVictoryScreen title="Важно помнить" onContinue={onComplete} continueLabel="Вперёд">
          <p>Молодец. Теперь ты понимаешь, почему важно проверять сайты и письма до того, как вводить данные.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
