import { useState, useMemo } from 'react'
import { level1TestQuestions, level1TestFill } from './level1FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level1.css'

const MC_COUNT = level1TestQuestions.length
const TOTAL_STEPS = MC_COUNT + 1

export function Level1FinalTest({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [fill, setFill] = useState({})
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const fillCorrect = useMemo(() => {
    return level1TestFill.blanks.every((b) => (fill[b.id] || '') === b.answer)
  }, [fill])

  const validateMc = () => {
    for (const q of level1TestQuestions) {
      if (answers[q.id] !== q.correct) return false
    }
    return true
  }

  const goNext = () => {
    if (step < MC_COUNT - 1) setStep((s) => s + 1)
  }

  const checkMcBlock = () => {
    const firstWrong = level1TestQuestions.findIndex((q) => answers[q.id] !== q.correct)
    if (firstWrong === -1) {
      setSubmitted(false)
      setStep(MC_COUNT)
    } else {
      setSubmitted(true)
      setStep(firstWrong)
    }
  }

  const checkFill = () => {
    setSubmitted(true)
  }

  const allCorrect = submitted && validateMc() && fillCorrect
  const totalQs = TOTAL_STEPS

  if (allCorrect) {
    return (
      <div className="l1-game l1-test">
        <h2>Итоговый тест</h2>
        <LunoVictoryScreen title="Уровень пройден!" onContinue={onComplete} continueLabel="К выбору уровней">
          <p>Отлично! Ты ответил на все вопросы и закрепил тему безопасности профиля.</p>
        </LunoVictoryScreen>
      </div>
    )
  }

  return (
    <div className="l1-game l1-test">
      <h2>Итоговый тест</h2>
      <p className="l1-test-progress">
        Шаг {Math.min(step + 1, totalQs)} из {totalQs}
      </p>

      {step < MC_COUNT && (
        <div className="l1-test-q">
          <p>
            <strong>{step + 1}.</strong> {level1TestQuestions[step].question}
          </p>
          <div className="l1-test-options">
            {level1TestQuestions[step].options.map((o) => {
              const q = level1TestQuestions[step]
              return (
                <label key={o.key} className="l1-test-opt">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === o.key}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.key }))}
                  />
                  {o.text}
                </label>
              )
            })}
          </div>
          {submitted && answers[level1TestQuestions[step].id] !== level1TestQuestions[step].correct && (
            <p className="l1-feedback-bad">Неверно.</p>
          )}
          <div className="l1-test-nav">
            {step > 0 && (
              <button type="button" className="back-button" onClick={() => setStep((s) => s - 1)}>
                ← Назад
              </button>
            )}
            {step < MC_COUNT - 1 && (
              <button
                type="button"
                className="l1-btn-primary"
                onClick={goNext}
                disabled={!answers[level1TestQuestions[step].id]}
              >
                Далее
              </button>
            )}
            {step === MC_COUNT - 1 && (
              <button
                type="button"
                className="l1-btn-primary"
                onClick={checkMcBlock}
                disabled={!answers[level1TestQuestions[step].id]}
              >
                Перейти к заданию с пропусками
              </button>
            )}
          </div>
        </div>
      )}

      {step === MC_COUNT && (
        <div className="l1-test-q">
          <p>
            <strong>5.</strong> Заполните пропуски, выбрав вариант в каждом списке:
          </p>
          <p className="l1-word-bank l1-fill-hint">{level1TestFill.instruction}</p>
          {level1TestFill.blanks.map((b) => (
            <p key={b.id} className="l1-fill-line l1-fill-line-select">
              {b.sentenceBefore}{' '}
              <select
                className="l1-select"
                value={fill[b.id] ?? ''}
                onChange={(e) => setFill((f) => ({ ...f, [b.id]: e.target.value }))}
              >
                <option value="">— выберите —</option>
                {b.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>{' '}
              {b.sentenceAfter}
            </p>
          ))}
          <div className="l1-test-nav">
            <button type="button" className="back-button" onClick={() => setStep(MC_COUNT - 1)}>
              ← К вопросам
            </button>
            <button type="button" className="l1-btn-primary" onClick={checkFill}>
              Проверить ответы
            </button>
          </div>
          {submitted && !fillCorrect && (
            <p className="l1-feedback-bad">Есть ошибки в пропусках. Исправь и нажми «Проверить ответы» снова.</p>
          )}
        </div>
      )}
    </div>
  )
}
