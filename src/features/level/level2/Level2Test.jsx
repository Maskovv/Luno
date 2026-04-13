import { useMemo, useState } from 'react'
import { level2Test } from './level2FlowData'
import './level2.css'

function arraysEqualAsSets(a, b) {
  const sa = new Set(a)
  const sb = new Set(b)
  if (sa.size !== sb.size) return false
  for (const x of sa) if (!sb.has(x)) return false
  return true
}

export function Level2Test({ onComplete }) {
  const questions = useMemo(() => Object.entries(level2Test), [])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

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

  return (
    <div className="l2-card">
      <h2 className="l2-title">Тест</h2>
      {questions.map(([key, q], idx) => (
        <div key={key} className="l2-q">
          <p className="l2-q-title">
            <strong>{idx + 1})</strong> {q.question}
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
                      if (q.type === 'single') setSingle(key, opt)
                      else toggleMulti(key, opt)
                    }}
                  />
                  {opt}
                </label>
              )
            })}
          </div>
          {submitted && !allCorrect && (
            <p className="l2-err">Проверь ответ на этот вопрос.</p>
          )}
        </div>
      ))}

      {!allCorrect && (
        <button type="button" className="l2-primary" onClick={() => setSubmitted(true)}>
          Проверить
        </button>
      )}
      {submitted && !allCorrect && <p className="l2-err">Есть ошибки. Исправь и проверь снова.</p>}
      {allCorrect && (
        <div className="l2-win">
          <p>Отлично! Ты завершил уровень 2.</p>
          <button type="button" className="l2-primary" onClick={onComplete}>
            Завершить уровень
          </button>
        </div>
      )}
    </div>
  )
}

