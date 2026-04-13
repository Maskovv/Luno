import { useMemo, useState } from 'react'
import { level2Test } from './level2FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import '../LevelPage.css'
import './level2.css'

function arraysEqualAsSets(a, b) {
  const sa = new Set(a)
  const sb = new Set(b)
  if (sa.size !== sb.size) return false
  for (const x of sa) if (!sb.has(x)) return false
  return true
}

const ENTRIES = Object.entries(level2Test)

function mcErrHint(q) {
  if (q.type === 'multi') {
    return 'В этом вопросе несколько верных ответов — отметь все подходящие варианты и сними галочки с лишних.'
  }
  return 'Проверь ответ на этот вопрос.'
}

export function Level2Test({ onComplete }) {
  const questions = useMemo(() => ENTRIES, [])
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const [err, setErr] = useState(false)
  const [done, setDone] = useState(false)

  const [key, q] = questions[step] || []
  const total = questions.length

  const setSingle = (val) => setAnswers((a) => ({ ...a, [key]: [val] }))
  const toggleMulti = (val) =>
    setAnswers((a) => {
      const cur = new Set(a[key] || [])
      if (cur.has(val)) cur.delete(val)
      else cur.add(val)
      return { ...a, [key]: [...cur] }
    })

  const currentOk = () => {
    const a = answers[key] || []
    if (q.type === 'single') {
      return a.length === 1 && a[0] === q.correct[0]
    }
    return arraysEqualAsSets(a, q.correct)
  }

  const goNext = () => {
    if (!currentOk()) {
      setErr(true)
      return
    }
    setErr(false)
    if (step >= total - 1) {
      setDone(true)
      return
    }
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setErr(false)
    setStep((s) => Math.max(0, s - 1))
  }

  if (done) {
    return (
      <div className="l2-card">
        <h2 className="l2-title">Тест</h2>
        <LunoVictoryScreen title="Уровень пройден!" onContinue={onComplete} continueLabel="К выбору уровней">
          <p>Отлично! Ты закрепил тему фишинга и защиты в интернете.</p>
        </LunoVictoryScreen>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="l2-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-test-progress">
        Вопрос {step + 1} из {total}
      </p>

      <div className="l2-q">
        <p className="l2-q-title">
          <strong>{step + 1}.</strong> {q.question}
        </p>
        {q.type === 'multi' && (
          <p className="level-test-multi-hint">Можно выбрать несколько ответов — отметь все, что подходят.</p>
        )}
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
                    if (q.type === 'single') setSingle(opt)
                    else toggleMulti(opt)
                  }}
                />
                {opt}
              </label>
            )
          })}
        </div>
        {err && <p className="l2-err">{mcErrHint(q)}</p>}
      </div>

      <div className="level-test-nav">
        <div className="level-test-nav__back">
          {step > 0 ? (
            <button type="button" className="back-button" onClick={goBack}>
              ← Назад
            </button>
          ) : (
            <span className="level-test-nav__spacer" aria-hidden="true" />
          )}
        </div>
        <div className="level-test-nav__forward">
          <button
            type="button"
            className="l2-primary"
            onClick={goNext}
            disabled={q.type === 'single' ? !(answers[key]?.length === 1) : !(answers[key]?.length)}
          >
            {step >= total - 1 ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  )
}
