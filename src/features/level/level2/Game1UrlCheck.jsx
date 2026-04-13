import { useMemo, useState } from 'react'
import { game1Urls } from './level2FlowData'
import './level2.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Game1UrlCheck({ onComplete }) {
  const deck = useMemo(() => shuffle(game1Urls), [])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [last, setLast] = useState(null)

  const item = deck[idx]
  const done = idx >= deck.length

  const answer = (safe) => {
    const ok = item.safe === safe
    if (ok) setScore((s) => s + 1)
    setLast({ ok, why: item.why })
    setTimeout(() => {
      setLast(null)
      setIdx((i) => i + 1)
    }, 900)
  }

  if (done) {
    return (
      <div className="l2-card">
        <h2 className="l2-title">Игра 1: Проверка ссылок</h2>
        <p>
          Готово! Правильных ответов: <strong>{score}</strong> / {deck.length}
        </p>
        <button type="button" className="l2-primary" onClick={onComplete}>
          Продолжить
        </button>
      </div>
    )
  }

  return (
    <div className="l2-card">
      <h2 className="l2-title">Игра 1: Безопасная ссылка или фишинг?</h2>
      <p className="l2-sub">
        Выбери вариант. Это простая тренировка перед реальной ситуацией.
      </p>
      <div className="l2-url-box">
        <code>{item.url}</code>
      </div>
      <div className="l2-actions">
        <button type="button" className="l2-good" onClick={() => answer(true)}>
          Безопасно
        </button>
        <button type="button" className="l2-bad" onClick={() => answer(false)}>
          Фишинг
        </button>
      </div>
      {last && (
        <p className={last.ok ? 'l2-ok' : 'l2-err'}>
          {last.ok ? 'Верно. ' : 'Неверно. '} {last.why}
        </p>
      )}
      <p className="l2-progress">
        {idx + 1} / {deck.length}
      </p>
    </div>
  )
}

