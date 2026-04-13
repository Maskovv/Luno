import { useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import { TEST_QUESTIONS } from './level5FlowData'

export function Level5Test({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [err, setErr] = useState('')
  const [lunoOpen, setLunoOpen] = useState(false)

  const q = TEST_QUESTIONS[idx]
  const last = idx === TEST_QUESTIONS.length - 1

  const submit = () => {
    if (picked === null) return
    if (picked !== q.correctIndex) {
      setErr('Подумай ещё раз и выбери другой вариант.')
      return
    }
    setErr('')
    if (last) {
      onComplete()
      return
    }
    setLunoOpen(true)
  }

  const afterLuno = () => {
    setLunoOpen(false)
    setPicked(null)
    setIdx((i) => i + 1)
  }

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Тест</h2>
      <p className="l2-progress">
        Вопрос {idx + 1} из {TEST_QUESTIONS.length}
      </p>
      <div className="l2-q">
        <p className="l2-q-title">{q.q}</p>
        <div className="l2-opts">
          {q.options.map((opt, i) => (
            <label key={opt} className="l2-opt">
              <input type="radio" name={`t_${idx}`} checked={picked === i} onChange={() => setPicked(i)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
      <button type="button" className="l2-primary" onClick={submit}>
        Проверить
      </button>
      {err && <p className="l2-err">{err}</p>}

      {lunoOpen && (
        <div className="l5-modal-backdrop" role="dialog" aria-modal="true">
          <div className="l5-modal">
            <div className="l5-modal-luno-avatar">
              <LunoPhoto urls={LUNO_AVATAR_URLS} className="l5-luno-modal-photo" alt="" />
            </div>
            <h3 className="l5-modal-luno-title">Луно</h3>
            <div className="l5-modal-luno-body">
              <p>
                <RichText>{q.luno}</RichText>
              </p>
            </div>
            <button type="button" className="l5-btn-primary" onClick={afterLuno}>
              Следующий вопрос
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Level5FinalVictory({ onFinish }) {
  const line = TEST_QUESTIONS[TEST_QUESTIONS.length - 1].luno
  return (
    <LunoVictoryScreen
      title="Уровень 5 пройден!"
      onContinue={onFinish}
      continueLabel="К выбору уровней"
      lunoAvatarUrls={LUNO_AVATAR_URLS}
    >
      <p>
        <RichText>{line}</RichText>
      </p>
    </LunoVictoryScreen>
  )
}
