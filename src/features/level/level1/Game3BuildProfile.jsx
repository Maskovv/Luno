import { useMemo, useState } from 'react'
import { game3Cards } from './level1FlowData'
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

export function Game3BuildProfile({ onComplete }) {
  const pool = useMemo(() => shuffle(game3Cards.map((c) => ({ ...c }))), [])
  const [inProfile, setInProfile] = useState([])
  const [poolLeft, setPoolLeft] = useState(pool.map((c) => c.id))
  const [warn, setWarn] = useState(null)

  const addToProfile = (id) => {
    const card = pool.find((c) => c.id === id)
    if (!card) return
    if (!card.safe) {
      setWarn('Подумай ещё раз. Это конфиденциальные данные!')
      setTimeout(() => setWarn(null), 2500)
      return
    }
    setPoolLeft((p) => p.filter((x) => x !== id))
    setInProfile((p) => [...p, id])
  }

  const remove = (id) => {
    setInProfile((p) => p.filter((x) => x !== id))
    setPoolLeft((p) => [...p, id])
  }

  const safeIds = pool.filter((c) => c.safe).map((c) => c.id)
  const win =
    safeIds.length > 0 &&
    safeIds.length === inProfile.length &&
    safeIds.every((id) => inProfile.includes(id))

  return (
    <div className="l1-game">
      <h2>Игра 3: Создай безопасный профиль для Маши</h2>
      <p className="l1-hint">
        Нажми на карточку слева — если она безопасная, она попадёт в профиль. Небезопасные отклоняются.
      </p>
      <div className="l1-g3-layout">
        <div className="l1-g3-pool">
          <h4>Набор данных</h4>
          {poolLeft.map((id) => {
            const c = pool.find((x) => x.id === id)
            return (
              <button key={id} type="button" className="l1-g3-card" onClick={() => addToProfile(id)}>
                {c.text}
              </button>
            )
          })}
        </div>
        <div className="l1-g3-profile">
          <h4>Профиль Маши</h4>
          {inProfile.length === 0 && <p className="l1-g3-empty">Пустой шаблон — добавь безопасные сведения</p>}
          {inProfile.map((id) => {
            const c = pool.find((x) => x.id === id)
            return (
              <button key={id} type="button" className="l1-g3-in" onClick={() => remove(id)}>
                {c.text} ✕
              </button>
            )
          })}
        </div>
      </div>
      {warn && <p className="l1-feedback-bad">{warn}</p>}
      {win && (
        <LunoVictoryScreen title="Прекрасная работа!" onContinue={onComplete} continueLabel="Вперёд">
          <p>Ты собрал безопасный профиль для Маши — без лишних личных данных.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
