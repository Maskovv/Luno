import { useMemo, useState } from 'react'
import { mazeThreats } from './level3Data'
import {
  MAZE_SIZE,
  MAZE_SPEC_REVISION,
  buildMazeWalls,
  bfsPath,
  canMoveFrom,
  getCellDrawEdges,
} from './level3MazeSpec'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
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

const ICON = {
  virus: '🦠',
  spy: '🕵',
  ransom: '💸',
  adware: '📢',
  trojan: '🐴',
}

function buildCheckpoints(path, threats) {
  if (path.length < 3) return []
  const inner = path.slice(1, -1)
  const n = inner.length
  if (n < threats.length) return []
  const slots = [1, 2, 4, 6, 8]
  return threats.map((t, i) => {
    const j = Math.min(slots[i] ?? Math.floor(((i + 1) / (threats.length + 1)) * n), n - 1)
    const [x, y] = inner[j]
    return { id: t.id, x, y, icon: ICON[t.id] || '❗' }
  })
}

export function Level3Maze({ onNext }) {
  const built = buildMazeWalls()
  const path = bfsPath(built.horiz, built.vert) || []
  const checkpoints = buildCheckpoints(path, mazeThreats)
  const { horiz, vert } = built

  const start = { x: 0, y: 0 }
  const finish = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 }

  const [pos, setPos] = useState(start)
  const [visited, setVisited] = useState(new Set([`${start.x},${start.y}`]))
  const [resolved, setResolved] = useState({})
  const [activeThreat, setActiveThreat] = useState(null)
  const [selected, setSelected] = useState([])
  const [err, setErr] = useState('')
  const [hint, setHint] = useState(
    'Лабиринт 7×7: вход сверху слева, выход внизу справа. Обезвредь все 5 угроз на пути.',
  )
  const [showVictory, setShowVictory] = useState(false)

  const cpMap = useMemo(() => {
    const m = new Map()
    checkpoints.forEach((c) => m.set(`${c.x},${c.y}`, c))
    return m
  }, [checkpoints])

  const curThreat = mazeThreats.find((t) => t.id === activeThreat)
  const curOptions = useMemo(
    () => (curThreat ? shuffleArray([...curThreat.ok, ...curThreat.bad]) : []),
    [curThreat],
  )

  const move = (dx, dy) => {
    if (activeThreat) return
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (!canMoveFrom(pos.x, pos.y, dx, dy, horiz, vert)) return
    setPos({ x: nx, y: ny })
    setVisited((v) => new Set([...v, `${nx},${ny}`]))
    const cp = cpMap.get(`${nx},${ny}`)
    if (cp && !resolved[cp.id]) {
      setActiveThreat(cp.id)
      setHint('Опасность обнаружена. Отметь только правильные действия.')
    } else if (nx === finish.x && ny === finish.y) {
      const allResolved = checkpoints.every((c) => resolved[c.id])
      if (allResolved) {
        setShowVictory(true)
      } else {
        setHint('До выхода дошли, но не все угрозы обезврежены.')
      }
    }
  }

  const toggle = (x) => {
    setSelected((s) => (s.includes(x) ? s.filter((v) => v !== x) : [...s, x]))
  }

  const submitThreat = () => {
    if (!curThreat) return
    if (!arraysEqualAsSets(selected, curThreat.ok)) {
      setErr('Не совсем так. Выбери только правильные действия из списка.')
      return
    }
    setErr('')
    setSelected([])
    setResolved((r) => ({ ...r, [curThreat.id]: true }))
    setActiveThreat(null)
    setHint('Угроза устранена. Продолжай путь к выходу.')
  }

  const allResolved = checkpoints.every((c) => resolved[c.id])

  return (
    <div className="l2-card l3-cyber">
      <h2 className="l2-title">Игра 1: Лабиринт угроз</h2>
      <p className="l2-sub">
        Сетка 7×7: чёрные границы — стены. Обезвредь все 5 угроз.
        Управление — стрелки справа.
      </p>

      <div className="l3-maze-playfield">
        <div
          key={`maze-${MAZE_SPEC_REVISION}`}
          className="l3-maze-grid l3-maze-grid--spec"
          style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)` }}
        >
          {Array.from({ length: MAZE_SIZE * MAZE_SIZE }).map((_, i) => {
            const x = i % MAZE_SIZE
            const y = Math.floor(i / MAZE_SIZE)
            const key = `${x},${y}`
            const w = getCellDrawEdges(x, y, horiz, vert)
            const isPlayer = pos.x === x && pos.y === y
            const isVisited = visited.has(key)
            const cp = cpMap.get(key)
            const isFinish = x === finish.x && y === finish.y
            const isResolved = cp && resolved[cp.id]
            const wallStyle = {
              borderTopWidth: w.top ? 3 : 0,
              borderRightWidth: w.right ? 3 : 0,
              borderBottomWidth: w.bottom ? 3 : 0,
              borderLeftWidth: w.left ? 3 : 0,
              borderStyle: 'solid',
              borderColor: '#0a0a0a',
            }
            return (
              <div
                key={key}
                className={`l3-cell l3-cell--spec ${isFinish ? 'l3-finish' : ''} ${isVisited ? 'l3-visited' : ''}`}
                style={wallStyle}
              >
                <div className="l3-cell-fg">
                  {cp && !isResolved && <span className="l3-threat">{cp.icon}</span>}
                  {cp && isResolved && <span className="l3-cleared">✅</span>}
                  {isPlayer && <span className="l3-player">🕹</span>}
                  {x === start.x && y === start.y && !isPlayer && <span className="l3-start">▶</span>}
                  {isFinish && !isPlayer && <span className="l3-exit-hint">⬇</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="l3-maze-side-controls" aria-label="Управление героем">
          <button type="button" className="l2-good l3-maze-arrow" onClick={() => move(0, -1)}>
            ↑
          </button>
          <div className="l3-maze-arrow-row">
            <button type="button" className="l2-good l3-maze-arrow" onClick={() => move(-1, 0)}>
              ←
            </button>
            <button type="button" className="l2-good l3-maze-arrow" onClick={() => move(1, 0)}>
              →
            </button>
          </div>
          <button type="button" className="l2-good l3-maze-arrow" onClick={() => move(0, 1)}>
            ↓
          </button>
        </div>
      </div>

      <p className="l2-progress">Обезврежено угроз: {Object.keys(resolved).length} / 5</p>
      <p className="l2-sub">{hint}</p>

      {activeThreat && curThreat && (
        <div className="l3-threat-overlay" role="presentation">
          <div className="l3-threat-modal">
            <p>
              <strong>{curThreat.title}</strong>
            </p>
            <p>{curThreat.text}</p>
            <div className="l2-opts">
              {curOptions.map((o) => (
                <label key={o} className="l2-opt">
                  <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
                  {o}
                </label>
              ))}
            </div>
            {err && <p className="l2-err">{err}</p>}
            <button type="button" className="l2-primary" onClick={submitThreat}>
              Применить действия
            </button>
          </div>
        </div>
      )}

      {showVictory && allResolved && pos.x === finish.x && pos.y === finish.y && (
        <LunoVictoryScreen
          className="luno-victory--l3"
          title="Лабиринт пройден!"
          onContinue={onNext}
          continueLabel="Вперёд"
        >
          <p>Отлично! Все угрозы обезврежены, ты выбрал правильные действия.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
