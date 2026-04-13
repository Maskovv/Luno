import { useMemo, useState } from 'react'
import { level2Test } from './level2FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level2.css'

function arraysEqualAsSets(a, b) {
  const sa = new Set(a)
  const sb = new Set(b)
  if (sa.size !== sb.size) return false
  for (const x of sa) if (!sb.has(x)) return false
  return true
}

export function Level2Test({ onComplete, lunoAvatarUrls }) {
  const questions = useMemo(() => Object.entries(level2Test), [])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState('')

  const setSingle = (key, val) => setAnswers((a) => ({ ...a, [key]: [val] }))
  const toggleMulti = (key, val) =>
    setAnswers((a) => {
      const cur = new Set(a[key] || [])
      if (cur.has(val)) cur.delete(val)
      else cur.add(val)
      return { ...a, [key]: [...cur] }
    })

  const validate = () => {
    for (const [key, q] of questions) {
      const a = answers[key] || []
      if (q.type === 'single') {
        if (a.length !== 1 || a[0] !== q.correct[0]) return false
      } else {
        if (!arraysEqualAsSets(a, q.correct)) return false
      }
    }
    return true
  }

  const allCorrect = submitted && validate()
  const [key, q] = questions[step]
  const progress = `${step + 1} / ${questions.length}`

  const goNext = () => {
    const curAnswer = answers[key] || []
    const isCurCorrect =
      q.type === 'single'
        ? curAnswer.length === 1 && curAnswer[0] === q.correct[0]
        : arraysEqualAsSets(curAnswer, q.correct)
    if (!isCurCorrect) {
      setStepError('Неверно. Исправь ответ, чтобы перейти дальше.')
      return
    }
    setStepError('')
    if (step < questions.length - 1) setStep((s) => s + 1)
  }

  const checkAll = () => {
    const firstWrong = questions.findIndex(([qKey, qq]) => {
      const a = answers[qKey] || []
      if (qq.type === 'single') return a.length !== 1 || a[0] !== qq.correct[0]
      return !arraysEqualAsSets(a, qq.correct)
    })
    if (firstWrong === -1) {
      setSubmitted(true)
      return
    }
    setSubmitted(true)
    setStep(firstWrong)
  }

  if (allCorrect) {
    return (
      <div className="l2-card">
        <h2 className="l2-title">Тест</h2>
        <LunoVictoryScreen
          title="Уровень 2 пройден!"
          onContinue={onComplete}
          continueLabel="К выбору уровней"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>Отлично! Ты завершил уровень 2.</p>
        </LunoVictoryScreen>
      </div>
    )
  }

  return (
    <div className="l2-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-progress">Шаг {progress}</p>
      <div key={key} className="l2-q">
        <p className="l2-q-title">
          <strong>{step + 1})</strong> {q.question}
        </p>
        <div className="l2-opts">
          {q.options.map((opt) => {
            const checked = (answers[key] || []).includes(opt)
            return (
              <label key={opt} className="l2-opt">
                <input
                  type={q.type === 'single' ? 'radio' : 'checkbox'}
                  name={key}
                  checked={checked}
                  onChange={() => {
                    setStepError('')
                    if (q.type === 'single') setSingle(key, opt)
                    else toggleMulti(key, opt)
                  }}
                />
                {opt}
              </label>
            )
          })}
        </div>
        {stepError && <p className="l2-err">{stepError}</p>}
      </div>

      <div className="l2-test-nav">
        {step > 0 && (
          <button type="button" className="back-button" onClick={() => setStep((s) => s - 1)}>
            Назад
          </button>
        )}
        {step < questions.length - 1 ? (
          <button
            type="button"
            className="l2-primary"
            onClick={goNext}
            disabled={(answers[key] || []).length === 0}
          >
            Далее
          </button>
        ) : (
          <button
            type="button"
            className="l2-primary"
            onClick={checkAll}
            disabled={(answers[key] || []).length === 0}
          >
            Проверить
          </button>
        )}
      </div>
      {submitted && !allCorrect && <p className="l2-err">Есть ошибки. Проверь вопросы и попробуй снова.</p>}
    </div>
  )
}

