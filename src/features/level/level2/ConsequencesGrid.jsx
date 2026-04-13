import { useState } from 'react'
import { consequencesCards } from './level2FlowData'
import './level2.css'

export function ConsequencesGrid({ onComplete }) {
  const [open, setOpen] = useState({})

  const openedCount = Object.values(open).filter(Boolean).length
  const done = openedCount === consequencesCards.length

  return (
    <div className="l2-card">
      <h2 className="l2-title">Что может случиться после фишинга?</h2>
      <p className="l2-sub">
        Нажми на все карточки, чтобы узнать последствия. Открыто: {openedCount} / {consequencesCards.length}
      </p>
      <div className="l2-grid">
        {consequencesCards.map((c) => {
          const isOpen = !!open[c.id]
          return (
            <button
              key={c.id}
              type="button"
              className={`l2-cons ${isOpen ? 'l2-cons-open' : ''}`}
              onClick={() => setOpen((o) => ({ ...o, [c.id]: true }))}
            >
              <div className="l2-cons-title">{c.title}</div>
              <div className="l2-cons-body">{isOpen ? c.text : 'Нажми, чтобы открыть'}</div>
            </button>
          )
        })}
      </div>
      {done && (
        <div className="l2-win">
          <p>Молодец. Теперь ты понимаешь, почему важно проверять сайты и письма.</p>
          <button type="button" className="l2-primary" onClick={onComplete}>
            К тесту
          </button>
        </div>
      )}
    </div>
  )
}

