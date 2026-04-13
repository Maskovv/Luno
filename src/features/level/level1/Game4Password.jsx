import { useEffect, useState, useCallback, useMemo } from 'react'
import { game4Hints } from './level1FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level1.css'

const INITIAL = 'mashapetrova'
const INITIAL_TIME = 20
const BONUS_TIME = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ACTION_DEFS = [
  { id: 'digits', kind: 'good', label: 'Добавить цифры' },
  { id: 'sym', kind: 'good', label: 'Добавить символы' },
  { id: '2fa', kind: 'good', label: 'Включить 2FA' },
  { id: 'ignore', kind: 'bad', label: 'Проигнорировать' },
  { id: 'personal', kind: 'bad', label: 'Использовать личные данные' },
  { id: 'short', kind: 'bad', label: 'Уменьшить длину пароля' },
  { id: 'reuse', kind: 'bad', label: 'Использовать тот же пароль, что везде' },
  { id: 'simple', kind: 'bad', label: 'Упростить до «qwerty»' },
  { id: 'share', kind: 'bad', label: 'Отправить пароль в чат' },
  { id: 'note', kind: 'bad', label: 'Записать пароль на стикер' },
]

export function Game4Password({ onWin }) {
  const actions = useMemo(() => shuffle(ACTION_DEFS), [])
  const [time, setTime] = useState(INITIAL_TIME)
  const [pwd, setPwd] = useState(INITIAL)
  const [doneGood, setDoneGood] = useState(() => new Set())
  const [msg, setMsg] = useState(null)
  const [badFlash, setBadFlash] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (won || time <= 0) return
    const t = setInterval(() => setTime((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [won, time])

  const addTime = useCallback(() => {
    setTime((s) => s + BONUS_TIME)
  }, [])

  const applyGood = (id) => {
    if (won) return
    if (doneGood.has(id)) {
      setMsg('Это действие уже сделано — выбери другой способ усиления пароля.')
      return
    }
    setDoneGood((d) => {
      const next = new Set([...d, id])
      if (next.has('digits') && next.has('sym') && next.has('2fa')) setWon(true)
      return next
    })
    addTime()
    if (id === 'digits') {
      setPwd((p) => p + '345672')
      setMsg('Хорошо. Ты значительно усложнил пароль. Добавлены цифры.')
    }
    if (id === 'sym') {
      setPwd((p) => 'm6a!34' + p.slice(4) + '@5')
      setMsg('Хорошо. Добавлены специальные символы.')
    }
    if (id === '2fa') {
      setMsg('Отличное решение. Теперь даже при подборе пароля вход будет заблокирован.')
    }
  }

  const applyBad = (id) => {
    if (won) return
    setBadFlash(true)
    setTimeout(() => setBadFlash(false), 400)
    if (id === 'ignore') setMsg('Время ограничено. Слабый пароль будет взломан очень быстро.')
    if (id === 'personal') setMsg('Осторожно. Личная информация — первое, что проверяет злоумышленник.')
    if (id === 'short') setMsg('Уменьшать длину пароля нельзя. Нужна сложность.')
    if (id === 'reuse') setMsg('Один пароль на все сервисы — если угонят один, угонят всё.')
    if (id === 'simple') setMsg('Словарные и простые пароли подбирают за секунды.')
    if (id === 'share') setMsg('Пароль нельзя отправлять другим — это сразу компрометация.')
    if (id === 'note') setMsg('Стикер рядом с компьютером — лёгкая добыча для чужих глаз.')
  }

  const onAction = (def) => {
    if (def.kind === 'good') applyGood(def.id)
    else applyBad(def.id)
  }

  const reset = () => {
    setTime(INITIAL_TIME)
    setPwd(INITIAL)
    setDoneGood(new Set())
    setMsg(null)
    setWon(false)
  }

  if (won) {
    return (
      <LunoVictoryScreen title="Атака остановлена" onContinue={onWin} continueLabel="Вперёд">
        <p>
          <strong>Луно:</strong> Вы приняли правильные решения:
        </p>
        <ul className="luno-victory-checklist">
          <li>усилили пароль</li>
          <li>исключили личные данные</li>
          <li>включили дополнительную защиту</li>
        </ul>
        <p>
          Помни, что не следует использовать один и тот же пароль в разных сервисах, даже если он сложный.
        </p>
      </LunoVictoryScreen>
    )
  }

  if (time <= 0) {
    return (
      <div className="l1-game l1-game4-lose">
        <h2>Доступ получен</h2>
        <p className="l1-feedback-bad">
          <strong>Луно:</strong> Аккаунт был взломан. Причина — недостаточная защита.
        </p>
        <button type="button" className="l1-btn-primary" onClick={reset}>
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className={`l1-game ${badFlash ? 'l1-shake' : ''}`}>
      <h2>Игра 4: Усиль пароль за ограниченное время</h2>
      <div className="l1-timer">⏱ {time} сек</div>
      <p className="l1-pwd-display l1-pwd-display-large">
        Текущий пароль: <code>{pwd}</code>
      </p>
      <div className="l1-game4-btns l1-game4-btns-grid">
        {actions.map((def) => (
          <button
            key={def.id}
            type="button"
            className="l1-game4-action"
            onClick={() => onAction(def)}
          >
            {def.label}
          </button>
        ))}
      </div>
      {msg && (
        <p className="l1-luno-box l1-luno-box-large">
          <strong>Луно:</strong> {msg}
        </p>
      )}
      <div className="l1-hint-block l1-hint-block-large">
        {game4Hints.map((h, i) => (
          <p key={i}>{h}</p>
        ))}
      </div>
      <p className="l1-hint l1-hint-spoiler-free">
        Успей усилить защиту до конца таймера: думай о длине пароля, разном регистре, цифрах, символах и о
        дополнительном подтверждении входа.
      </p>
    </div>
  )
}
