import { useState } from 'react'
import { RichText } from '../../../shared/components/RichText'
import { consequencesCards } from './level2FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

export function ConsequencesGrid({ onComplete, lunoAvatarUrls }) {
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
              className={`l2-cons ${isOpen ? 'l2-cons-open' : 'l2-cons-face'}`}
              style={
                isOpen
                  ? undefined
                  : {
                      background: c.closedBg,
                      borderColor: 'transparent',
                    }
              }
              onClick={() => setOpen((o) => ({ ...o, [c.id]: true }))}
            >
              {isOpen ? (
                <>
                  <div className="l2-cons-title">
                    <RichText>{c.title}</RichText>
                  </div>
                  <div className="l2-cons-body">
                    <RichText>{c.text}</RichText>
                  </div>
                </>
              ) : (
                <span className="l2-cons-emoji" aria-hidden>
                  {c.emoji}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {done && (
        <LunoVictoryScreen
          title="Молодец!"
          onContinue={onComplete}
          continueLabel="К тесту"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>
            <RichText>Теперь ты понимаешь, почему важно **проверять сайты и письма**.</RichText>
          </p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
