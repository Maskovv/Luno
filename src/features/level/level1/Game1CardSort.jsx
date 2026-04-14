import { useMemo, useState } from 'react'
import { game1Cards } from './level1FlowData'
import { RichText } from '../../../shared/components/RichText'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level1.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const BAD_FEEDBACK_MS = 4000

export function Game1CardSort({ onComplete, lunoAvatarUrls }) {
  const deck = useMemo(() => {
    const items = [
      ...game1Cards.share.map((text) => ({ text, correct: 'share' })),
      ...game1Cards.noShare.map((text) => ({ text, correct: 'noShare' })),
    ]
    return shuffle(items)
  }, [])

  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const place = (zone) => {
    if (selected === null) return
    const card = deck[selected]
    const ok = card.correct === zone
    if (!ok) {
      setFeedback('bad')
      setTimeout(() => setFeedback(null), BAD_FEEDBACK_MS)
      return
    }
    setPlaced((p) => ({ ...p, [selected]: zone }))
    setSelected(null)
  }

  const unplaced = deck.map((c, i) => ({ ...c, i })).filter((el) => placed[el.i] == null)

  const allCorrect =
    Object.keys(placed).length === deck.length && deck.every((c, i) => placed[i] === c.correct)

  return (
    <div className="l1-game">
      <div className="l1-game-head">
        <h2>Игра 1: «Можно делиться» или «Нельзя делиться»</h2>
        <p className="l1-hint">
          Выберите карточку, затем нажмите «Положить сюда» под нужной колонкой.
        </p>
      </div>
      <div className="l1-sort-zones">
        <div className="l1-zone l1-zone-safe">
          <h3>Можно делиться</h3>
          <div className="l1-zone-drop">
            {deck.map(
              (c, i) =>
                placed[i] === 'share' && (
                  <button
                    key={i}
                    type="button"
                    className="l1-mini-card"
                    onClick={() => {
                      setPlaced((p) => {
                        const n = { ...p }
                        delete n[i]
                        return n
                      })
                    }}
                  >
                    {c.text}
                  </button>
                ),
            )}
          </div>
          <button type="button" className="l1-zone-btn" onClick={() => place('share')}>
            Положить сюда
          </button>
        </div>
        <div className="l1-zone l1-zone-danger">
          <h3>Нельзя делиться</h3>
          <div className="l1-zone-drop">
            {deck.map(
              (c, i) =>
                placed[i] === 'noShare' && (
                  <button
                    key={i}
                    type="button"
                    className="l1-mini-card"
                    onClick={() => {
                      const n = { ...placed }
                      delete n[i]
                      setPlaced(n)
                    }}
                  >
                    {c.text}
                  </button>
                ),
            )}
          </div>
          <button type="button" className="l1-zone-btn" onClick={() => place('noShare')}>
            Положить сюда
          </button>
        </div>
      </div>

      <div className="l1-pool">
        <h4>Карточки ({unplaced.length} осталось)</h4>
        <div className="l1-pool-cards">
          {unplaced.map(({ text, i }) => (
            <button
              key={i}
              type="button"
              className={`l1-card ${selected === i ? 'l1-card-sel' : ''}`}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      {feedback === 'bad' && (
        <p className="l1-feedback-bad">Подумай ещё раз — эта карточка относится к другой колонке.</p>
      )}
      {allCorrect && (
        <LunoVictoryScreen
          title="Отлично!"
          onContinue={onComplete}
          continueLabel="Вперёд"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>
            <RichText>
              Ты разобрался, какие сведения можно указывать **открыто**, а какие лучше **не публиковать**.
            </RichText>
          </p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
