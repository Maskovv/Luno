import { useState } from 'react'
import { level3TestMc, level3FillTasks } from './level3Data'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import '../LevelPage.css'
import '../level2/level2.css'
import './level3.css'

function arraysEqualAsSets(a, b) {
  const A = new Set(a)
  const B = new Set(b)
  if (A.size !== B.size) return false
  for (const x of A) if (!B.has(x)) return false
  return true
}

function shuffleArray(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const MC = level3TestMc.map((q) => ({ ...q, o: shuffleArray([...q.o]) }))
const TOTAL_STEPS = MC.length + level3FillTasks.length

function mcErrHint(q) {
  if (q.type === 'multi') {
    return 'В этом вопросе несколько верных ответов: отметь все подходящие пункты и сними галочки с тех, что снижают безопасность (например, совет незнакомца).'
  }
  return 'Проверь ответ на этот вопрос.'
}

export function Level3Test({ onComplete }) {
  const [step, setStep] = useState(0)
  const [ans, setAns] = useState({})
  const [fills, setFills] = useState({})
  const [err, setErr] = useState(false)
  const [done, setDone] = useState(false)

  const mcIndex = step < MC.length ? step : -1
  const fillIndex = step >= MC.length ? step - MC.length : -1

  const setSingle = (i, v) => setAns((a) => ({ ...a, [i]: [v] }))
  const toggleMulti = (i, v) =>
    setAns((a) => {
      const cur = new Set(a[i] || [])
      if (cur.has(v)) cur.delete(v)
      else cur.add(v)
      return { ...a, [i]: [...cur] }
    })

  const checkMc = (i) => {
    const q = MC[i]
    const a = ans[i] || []
    if (q.type === 'single') return a.length === 1 && a[0] === q.c[0]
    return arraysEqualAsSets(a, q.c)
  }

  const checkFill = (ti) => {
    const task = level3FillTasks[ti]
    return task.answers.every((x, li) => (fills[`${ti}_${li}`] || '') === x)
  }

  const goNext = () => {
    if (mcIndex >= 0) {
      if (!checkMc(mcIndex)) {
        setErr(true)
        return
      }
      setErr(false)
      setStep((s) => s + 1)
      return
    }
    if (fillIndex >= 0) {
      if (!checkFill(fillIndex)) {
        setErr(true)
        return
      }
      setErr(false)
      if (step >= TOTAL_STEPS - 1) setDone(true)
      else setStep((s) => s + 1)
    }
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
          <p>Отлично! Ты закрепил тему вирусов и защиты устройства.</p>
        </LunoVictoryScreen>
      </div>
    )
  }

  return (
    <div className="l2-card l3-test-root">
      <h2 className="l2-title">Тест</h2>
      <p className="l3-test-step">Шаг {step + 1} из {TOTAL_STEPS}</p>

      {mcIndex >= 0 && (
        <div className="l2-q">
          <p className="l2-q-title l3-test-q">{MC[mcIndex].q}</p>
          {MC[mcIndex].type === 'multi' && (
            <p className="level-test-multi-hint">Можно выбрать несколько ответов — отметь все, что подходят.</p>
          )}
          <div className="l2-opts">
            {MC[mcIndex].o.map((o) => (
              <label key={o} className="l2-opt">
                <input
                  type={MC[mcIndex].type === 'single' ? 'radio' : 'checkbox'}
                  name={`mc_${mcIndex}`}
                  checked={(ans[mcIndex] || []).includes(o)}
                  onChange={() =>
                    MC[mcIndex].type === 'single' ? setSingle(mcIndex, o) : toggleMulti(mcIndex, o)
                  }
                />
                {o}
              </label>
            ))}
          </div>
          {err && <p className="l2-err">{mcIndex >= 0 ? mcErrHint(MC[mcIndex]) : 'Проверь ответ.'}</p>}
        </div>
      )}

      {fillIndex >= 0 && (
        <div className="l2-q">
          <p className="l2-q-title l3-test-q">{level3FillTasks[fillIndex].title}</p>
          <p className="l2-sub">Слова: {level3FillTasks[fillIndex].bank.join(', ')}</p>
          {level3FillTasks[fillIndex].lines.map((line, li) => (
            <p key={li} className="l3-fill-line">
              {line[0]}{' '}
              <select
                value={fills[`${fillIndex}_${li}`] || ''}
                onChange={(e) => setFills((f) => ({ ...f, [`${fillIndex}_${li}`]: e.target.value }))}
              >
                <option value="">— выберите —</option>
                {level3FillTasks[fillIndex].bank.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>{' '}
              {line[1]}
            </p>
          ))}
          {err && <p className="l2-err">Проверь пропуски.</p>}
        </div>
      )}

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
            disabled={
              mcIndex >= 0
                ? MC[mcIndex].type === 'single'
                  ? !(ans[mcIndex]?.length === 1)
                  : !(ans[mcIndex]?.length > 0)
                : false
            }
          >
            {step >= TOTAL_STEPS - 1 ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  )
}
