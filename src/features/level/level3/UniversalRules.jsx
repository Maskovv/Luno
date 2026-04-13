import { useMemo, useState } from 'react'
import { universalRules } from './level3Data'
import '../level2/level2.css'
import './level3.css'

export function UniversalRules({ onNext }) {
  const [open, setOpen] = useState(null)
  const [revealed, setRevealed] = useState({})
  const active = universalRules.find((r) => r.n === open)

  const openedCount = useMemo(() => universalRules.filter((r) => revealed[r.n]).length, [revealed])
  const allRead = openedCount === universalRules.length

  const markRead = (n) => {
    setRevealed((prev) => ({ ...prev, [n]: true }))
  }

  return (
    <div className="l2-card l3-rules-root">
      <h2 className="l2-title">Универсальные правила безопасности</h2>
      <p className="l2-sub">
        Открой каждую карточку и прочитай правило — как в блоке «последствия» на уровне 2. Кнопка «Далее»
        станет доступна, когда откроешь все {universalRules.length}.
      </p>
      <p className="l3-rules-progress">
        Открыто и прочитано: <strong>{openedCount}</strong> / {universalRules.length}
      </p>

      <div className="l3-rules-tiles">
        {universalRules.map((r) => {
          const isRev = !!revealed[r.n]
          return (
            <button
              key={r.n}
              type="button"
              className={`l3-rules-tile ${isRev ? 'l3-rules-tile--read' : ''} ${open === r.n ? 'l3-rules-tile--active' : ''}`}
              onClick={() => setOpen(r.n)}
            >
              <span className="l3-rules-tile-num">{r.n}</span>
              {!isRev ? (
                <>
                  <span className="l3-rules-tile-back-hint">?</span>
                  <span className="l3-rules-tile-title l3-rules-tile-title--muted">Карточка закрыта</span>
                  <span className="l3-rules-tile-cta">Открыть</span>
                </>
              ) : (
                <>
                  <span className="l3-rules-tile-title">{r.title}</span>
                  <span className="l3-rules-tile-cta">Прочитано ✓</span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {active && (
        <div
          className="l3-rules-read-backdrop"
          role="presentation"
          onClick={() => {
            markRead(active.n)
            setOpen(null)
          }}
        >
          <div
            className="l3-rules-read-modal"
            role="dialog"
            aria-labelledby="l3-rule-read-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="l3-rules-read-head">
              <span className="l3-rules-read-badge">{active.n}</span>
              <h3 id="l3-rule-read-title">{active.title}</h3>
            </div>
            <p className="l3-rules-read-body">{active.body}</p>
            <button
              type="button"
              className="l2-primary l3-rules-read-close"
              onClick={() => {
                markRead(active.n)
                setOpen(null)
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      <button type="button" className="l2-primary l3-rules-cta" disabled={!allRead} onClick={onNext}>
        Далее
      </button>
      {!allRead && (
        <p className="l3-rules-cta-hint">Сначала открой и прочитай все карточки.</p>
      )}
    </div>
  )
}
