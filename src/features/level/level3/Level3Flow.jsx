import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { RichText } from '../../../shared/components/RichText'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import {
  LEVEL3_TITLE,
  level3Flow,
  threats,
  level3TestQuestions,
  level3FillTasks,
} from './level3FlowData'
import { Level3TheoryCarousel } from './Level3TheoryCarousel'
import { Level3Scene2Popups } from './Level3Scene2Popups'
import { Level3SafePc } from './Level3SafePc'
import { level3UrlsForScene } from './level3Scenes'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import '../LevelPage.css'
import '../level1/level1.css'
import '../level2/level2.css'
import './level3.css'

const LEVEL_ID = '3'

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, i) => (
          <p key={i}>
            <RichText>{line}</RichText>
          </p>
        ))}
      </>
    )
  }
  return (
    <p>
      <RichText>{text}</RichText>
    </p>
  )
}

function Level3Backdrop({ bgKey }) {
  const urls = useMemo(() => (bgKey ? level3UrlsForScene(bgKey) : []), [bgKey])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [bgKey])

  const src = urls[attempt]
  if (!src || attempt >= urls.length) {
    return <div className="l1-backdrop l1-backdrop--empty" aria-hidden />
  }

  return (
    <div className="l1-backdrop" aria-hidden>
      <div className="l1-backdrop-picture">
        <img
          key={src}
          src={src}
          alt=""
          className="l1-backdrop-img"
          loading="eager"
          decoding="async"
          onError={() => setAttempt((a) => a + 1)}
        />
      </div>
    </div>
  )
}

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

function cellKey(x, y) {
  return `${x},${y}`
}

const MAZE_DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
]

function buildMazeByTractor(width, height, tractorCount = 1) {
  const walls = new Set()
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) walls.add(cellKey(x, y))
  }

  const carve = (x, y) => {
    const key = cellKey(x, y)
    walls.delete(key)
    return key
  }

  const isEvenCell = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    x % 2 === 0 &&
    y % 2 === 0

  const evenXs = []
  const evenYs = []
  for (let x = 0; x < width; x += 1) if (x % 2 === 0) evenXs.push(x)
  for (let y = 0; y < height; y += 1) if (y % 2 === 0) evenYs.push(y)

  const totalEvenCells = evenXs.length * evenYs.length
  const visitedEven = new Set()
  const tractors = []
  const usedStarts = new Set()
  // Всегда оставляем трактор в старте, чтобы структура росла от входа.
  tractors.push({ x: 0, y: 0 })
  usedStarts.add(cellKey(0, 0))
  visitedEven.add(carve(0, 0))
  while (tractors.length < tractorCount) {
    const x = evenXs[Math.floor(Math.random() * evenXs.length)]
    const y = evenYs[Math.floor(Math.random() * evenYs.length)]
    const key = cellKey(x, y)
    if (usedStarts.has(key)) continue
    usedStarts.add(key)
    tractors.push({ x, y })
    visitedEven.add(carve(x, y))
  }

  let guard = 0
  while (visitedEven.size < totalEvenCells && guard < 700000) {
    guard += 1
    const tIndex = Math.floor(Math.random() * tractors.length)
    const tractor = tractors[tIndex]
    const dir = MAZE_DIRS[Math.floor(Math.random() * MAZE_DIRS.length)]
    const nx = tractor.x + dir.dx * 2
    const ny = tractor.y + dir.dy * 2
    if (!isEvenCell(nx, ny)) continue
    carve(tractor.x + dir.dx, tractor.y + dir.dy)
    visitedEven.add(carve(nx, ny))
    tractors[tIndex] = { x: nx, y: ny }
  }

  // Гарантируем проход к финишу в правом нижнем углу.
  carve(width - 1, height - 1)
  carve(width - 2, height - 1)
  carve(width - 1, height - 2)
  carve(width - 2, height - 2)

  return walls
}

function parsePoint(key) {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function openNeighborsCount(walls, width, height, x, y) {
  let count = 0
  for (const { dx, dy } of MAZE_DIRS) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
    if (!walls.has(cellKey(nx, ny))) count += 1
  }
  return count
}

function buildPerfectMaze(width, height) {
  const walls = new Set()
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) walls.add(cellKey(x, y))
  }
  const carve = (x, y) => walls.delete(cellKey(x, y))
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height

  const stack = [{ x: 0, y: 0 }]
  carve(0, 0)

  while (stack.length) {
    const cur = stack[stack.length - 1]
    const candidates = []
    for (const { dx, dy } of MAZE_DIRS) {
      const nx = cur.x + dx * 2
      const ny = cur.y + dy * 2
      if (!inBounds(nx, ny)) continue
      if (!walls.has(cellKey(nx, ny))) continue
      candidates.push({ nx, ny, mx: cur.x + dx, my: cur.y + dy })
    }
    if (!candidates.length) {
      stack.pop()
      continue
    }
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    carve(pick.mx, pick.my)
    carve(pick.nx, pick.ny)
    stack.push({ x: pick.nx, y: pick.ny })
  }

  // Финиш обязательно достижим.
  carve(width - 1, height - 1)
  carve(width - 2, height - 1)
  carve(width - 1, height - 2)
  return walls
}

function bfsDistances(walls, width, height, start) {
  const q = [start]
  const dist = new Map([[cellKey(start.x, start.y), 0]])
  let qi = 0
  while (qi < q.length) {
    const cur = q[qi]
    qi += 1
    const curKey = cellKey(cur.x, cur.y)
    const curDist = dist.get(curKey) ?? 0
    for (const { dx, dy } of MAZE_DIRS) {
      const nx = cur.x + dx
      const ny = cur.y + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nKey = cellKey(nx, ny)
      if (walls.has(nKey) || dist.has(nKey)) continue
      dist.set(nKey, curDist + 1)
      q.push({ x: nx, y: ny })
    }
  }
  return dist
}

function mazeComplexityScore(walls, width, height, start, finish) {
  const distMap = bfsDistances(walls, width, height, start)
  const finishDist = distMap.get(cellKey(finish.x, finish.y))
  if (finishDist == null) return -Infinity

  let openCount = 0
  let deadEnds = 0
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (walls.has(cellKey(x, y))) continue
      openCount += 1
      const n = openNeighborsCount(walls, width, height, x, y)
      if (n === 1) deadEnds += 1
    }
  }

  // Длина пути + тупики + плотность стен.
  return finishDist * 22 + deadEnds * 12 - openCount
}

function buildMazeSetup(width, height, start, finish) {
  let bestWalls = null
  let bestScore = -Infinity
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const walls = buildPerfectMaze(width, height)
    const score = mazeComplexityScore(walls, width, height, start, finish)
    if (score > bestScore) {
      bestScore = score
      bestWalls = walls
    }
  }
  const walls = bestWalls || buildPerfectMaze(width, height)
  const pathCells = []
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = cellKey(x, y)
      if (!walls.has(key)) pathCells.push(key)
    }
  }

  const threatIds = ['virus', 'spy', 'ransom', 'adware', 'trojan']
  const checkpointTypes = [...threatIds, ...threatIds]
  const threatIcons = { virus: '🦠', spy: '🕵', ransom: '💸', adware: '📢', trojan: '🧩' }
  const candidates = shuffleArray(
    pathCells.filter((key) => {
      const { x, y } = parsePoint(key)
      if (x === start.x && y === start.y) return false
      if (x === finish.x && y === finish.y) return false
      const distFromStart = Math.abs(x - start.x) + Math.abs(y - start.y)
      const distFromFinish = Math.abs(x - finish.x) + Math.abs(y - finish.y)
      return distFromStart > 4 && distFromFinish > 3
    }),
  )

  const selectedPoints = []
  for (const key of candidates) {
    if (selectedPoints.length >= checkpointTypes.length) break
    const point = parsePoint(key)
    if (
      selectedPoints.some((p) => manhattan(p, point) < 4) ||
      manhattan(point, start) < 5 ||
      manhattan(point, finish) < 5
    ) {
      continue
    }
    selectedPoints.push(point)
  }

  while (selectedPoints.length < checkpointTypes.length) {
    const fallback = parsePoint(pathCells[Math.min(selectedPoints.length + 1, pathCells.length - 1)])
    selectedPoints.push(fallback)
  }

  const checkpoints = checkpointTypes.map((type, idx) => {
    const point = selectedPoints[idx]
    return {
      id: `cp_${idx}_${type}`,
      threatType: type,
      x: point.x,
      y: point.y,
      icon: threatIcons[type],
    }
  })

  return { walls, checkpoints }
}

/** stage 1 = первый экран; stage 2 = последствия/подробности */
function ThreatScreenVisual({ threat, stage, onAdvance }) {
  const s = threat?.screen
  if (!s) return null

  if (s.kind === 'virus') {
    if (stage === 1) {
      return (
        <div className="l3-threat-screen" aria-hidden>
          <div className="l3-mock-window">
            <div className="l3-mock-window-bar">
              <span className="l3-mock-dots" />
              <span className="l3-mock-window-title">Скачать игру</span>
            </div>
            <div className="l3-mock-window-body">
              <div className="l3-mock-file-row">
                <span className="l3-mock-file-ico">🎮</span>
                <span className="l3-mock-file-name">{s.fileName}</span>
              </div>
              <button type="button" className="l3-mock-btn-open" onClick={onAdvance}>
                Скачать
              </button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="l3-threat-screen" aria-hidden>
        <ul className="l3-threat-screen-list">
          {threat.symptoms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={onAdvance}>
          Что это такое?
        </button>
      </div>
    )
  }

  if (s.kind === 'spy') {
    if (stage === 1) {
      return (
        <div className="l3-threat-screen" aria-hidden>
          <div className="l3-mock-window l3-mock-window--narrow">
            <div className="l3-mock-window-bar">
              <span className="l3-mock-dots" />
              <span className="l3-mock-window-title">Скачать приложение</span>
            </div>
            <div className="l3-mock-window-body l3-mock-window-body--tight">
              <span className="l3-mock-tag-ok">скачано</span>
              <button type="button" className="l3-mock-btn-open" onClick={onAdvance}>
                Проверить доступ для приложения
              </button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="l3-threat-screen" aria-hidden>
        <div className="l3-mock-perms l3-mock-perms--solo">
          <p className="l3-mock-perms-title">Доступ приложения</p>
          <p className="l3-mock-perms-note">Полный доступ включён и не редактируется.</p>
          <ul className="l3-mock-perm-list">
            {s.permLabels.map((label) => (
              <li key={label} className="l3-mock-perm-row">
                <span>{label}</span>
                <span className="l3-mock-toggle l3-mock-toggle--on" aria-hidden>
                  вкл
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="l3-mock-notice-login" aria-hidden>
          <p className="l3-mock-notice-title">Уведомление безопасности</p>
          <p className="l3-mock-notice-text">В аккаунт выполнен вход с нового устройства</p>
        </div>
        <ul className="l3-threat-screen-list">
          {threat.symptoms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={onAdvance}>
          Что это такое?
        </button>
      </div>
    )
  }

  if (s.kind === 'ransom') {
    if (stage === 1) {
      return (
        <div className="l3-threat-screen" aria-hidden>
          <div className="l3-mock-window l3-mock-window--dl">
            <div className="l3-mock-window-bar">
              <span className="l3-mock-dots" />
              <span className="l3-mock-window-title">Архив</span>
            </div>
            <div className="l3-mock-window-body">
              <div className="l3-mock-file-row">
                <span className="l3-mock-file-ico">📦</span>
                <span className="l3-mock-file-name">{s.fileName}</span>
              </div>
              <button type="button" className="l3-mock-btn-open" onClick={onAdvance}>
                Открыть файл
              </button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="l3-threat-screen" aria-hidden>
        <div className="l3-mock-ransom">
          <p className="l3-mock-ransom-skull" aria-hidden>
            ☠
          </p>
          <p className="l3-mock-ransom-msg">{threat.ransomMessage}</p>
        </div>
        <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={onAdvance}>
          Что это такое?
        </button>
      </div>
    )
  }

  if (s.kind === 'adware') {
    if (stage === 1) {
      return (
        <div className="l3-threat-screen" aria-hidden>
          <div className="l3-mock-browser">
            <div className="l3-mock-browser-bar">
              <span className="l3-mock-browser-dot" />
              <span className="l3-mock-browser-dot" />
              <span className="l3-mock-browser-dot" />
              <span className="l3-mock-browser-url">браузер</span>
            </div>
            <div className="l3-mock-browser-body">
              <button type="button" className="l3-mock-btn-open" onClick={onAdvance}>
                {s.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="l3-threat-screen" aria-hidden>
        <div className="l3-mock-ads-cloud" aria-hidden>
          <span className="l3-mock-ad-chip">СУПЕР СКИДКА</span>
          <span className="l3-mock-ad-chip">ВЫ ВЫИГРАЛИ ПРИЗ</span>
          <span className="l3-mock-ad-chip">СРОЧНО ОБНОВИТЕ</span>
          <span className="l3-mock-ad-chip">КЛИКНИ СЕЙЧАС</span>
          <span className="l3-mock-ad-chip">+100% БОНУС</span>
        </div>
        <ul className="l3-threat-screen-list l3-threat-screen-list--tight">
          {threat.symptoms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={onAdvance}>
          Что это такое?
        </button>
      </div>
    )
  }

  if (s.kind === 'trojan') {
    if (stage === 1) {
      return (
        <div className="l3-threat-screen" aria-hidden>
          <div className="l3-mock-window l3-mock-window--dl">
            <div className="l3-mock-window-bar">
              <span className="l3-mock-dots" />
              <span className="l3-mock-window-title">Загрузки</span>
            </div>
            <div className="l3-mock-window-body">
              <div className="l3-mock-file-row">
                <span className="l3-mock-file-ico">🧩</span>
                <span className="l3-mock-file-name">{s.fileName}</span>
              </div>
              <button type="button" className="l3-mock-btn-open" onClick={onAdvance}>
                Запустить
              </button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="l3-threat-screen" aria-hidden>
        <ul className="l3-threat-screen-list">
          {threat.symptoms.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={onAdvance}>
          Что это такое?
        </button>
      </div>
    )
  }

  return null
}

function MazeGame({ onNext }) {
  const W = 20
  const H = 20
  const start = { x: 0, y: 0 }
  const finish = { x: W - 1, y: H - 1 }
  const maze = useMemo(() => buildMazeSetup(W, H, start, finish), [])
  const walls = maze.walls
  const checkpoints = maze.checkpoints

  const [pos, setPos] = useState(start)
  const [visited, setVisited] = useState(new Set([`${start.x},${start.y}`]))
  const [resolved, setResolved] = useState({})
  const [activeCheckpointId, setActiveCheckpointId] = useState(null)
  const [selected, setSelected] = useState([])
  const [err, setErr] = useState('')
  const [hint, setHint] = useState(
    'Запутанный лабиринт 20×20: развилки, повороты и тупики. Обезвредь все 5 угроз и дойди до выхода.',
  )
  const [done, setDone] = useState(false)
  /** visual1 → visual2 → luno → quiz */
  const [threatPhase, setThreatPhase] = useState('visual1')

  useEffect(() => {
    setSelected([])
    setErr('')
    setThreatPhase('visual1')
  }, [activeCheckpointId])

  const cpMap = useMemo(() => {
    const m = new Map()
    checkpoints.forEach((c) => m.set(`${c.x},${c.y}`, c))
    return m
  }, [])

  const activeCheckpoint = activeCheckpointId ? checkpoints.find((c) => c.id === activeCheckpointId) : null
  const curThreat = activeCheckpoint ? threats.find((t) => t.id === activeCheckpoint.threatType) : null
  const curOptions = useMemo(
    () => (curThreat ? shuffleArray([...curThreat.ok, ...curThreat.bad]) : []),
    [curThreat, activeCheckpointId],
  )

  const canMove = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !walls.has(`${x},${y}`)

  const move = (dx, dy) => {
    if (activeCheckpointId) return
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (!canMove(nx, ny)) return
    setPos({ x: nx, y: ny })
    setVisited((v) => new Set([...v, `${nx},${ny}`]))
    const cp = cpMap.get(`${nx},${ny}`)
    if (cp && !resolved[cp.id]) {
      setActiveCheckpointId(cp.id)
      setHint('Опасность обнаружена. Разбери ситуацию на экране, выслушай Луно и выбери действия.')
    } else if (nx === finish.x && ny === finish.y) {
      const allResolved = checkpoints.every((c) => resolved[c.id])
      if (allResolved) {
        setDone(true)
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
      setErr('Не совсем так. Выбери только правильные действия.')
      return
    }
    setErr('')
    setSelected([])
    setResolved((r) => ({ ...r, [activeCheckpoint.id]: true }))
    setActiveCheckpointId(null)
    setHint('Угроза устранена. Продолжай путь к выходу.')
  }

  if (done) {
    return (
      <LunoVictoryScreen
        title="Отлично!"
        onContinue={onNext}
        continueLabel="Вперёд"
        lunoAvatarUrls={LUNO_AVATAR_URLS}
      >
        <p>
          <RichText>
            — Поздравляю! 🎉 Теперь вы знаете, как **защитить себя от вирусов**.
          </RichText>
        </p>
        <p>
          <RichText>
            — Помните: **ваши знания** могут помочь не только вам, но и **вашим друзьям**.
          </RichText>
        </p>
        <p>
          <RichText>— **Делитесь** ими и будьте **внимательны в интернете**.</RichText>
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l3-cyber">
      <h2 className="l2-title">Игра 1: Лабиринт угроз</h2>
      <p className="l2-sub">
        Интернет можно сравнить с лабиринтом: есть развилки, повороты и короткие тупики, а угрозы стоят на
        пути к выходу. Обезвредь все угрозы и дойди до зелёной клетки.
      </p>

      <div className="l3-maze-wrap">
        <div className="l3-maze-plate">
          <div
            className="l3-maze-grid"
            style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}
          >
          {Array.from({ length: W * H }).map((_, i) => {
            const x = i % W
            const y = Math.floor(i / W)
            const key = `${x},${y}`
            const isWall = walls.has(key)
            const isPlayer = pos.x === x && pos.y === y
            const isVisited = visited.has(key)
            const cp = cpMap.get(key)
            const isFinish = x === finish.x && y === finish.y
            const isResolved = cp && resolved[cp.id]
            return (
              <div
                key={key}
                className={`l3-cell ${isWall ? 'l3-wall' : 'l3-road'} ${isFinish ? 'l3-finish' : ''} ${isVisited && !isWall ? 'l3-visited' : ''}`}
              >
                {cp && !isResolved && <span className="l3-threat">{cp.icon}</span>}
                {cp && isResolved && <span className="l3-cleared">✅</span>}
                {isPlayer && <span className="l3-player">🕹</span>}
                {x === start.x && y === start.y && !isPlayer && <span className="l3-start">▶</span>}
              </div>
            )
          })}
          </div>
          <div className="l3-maze-controls">
            <button type="button" className="l2-good" onClick={() => move(0, -1)}>↑</button>
            <div className="l3-row">
              <button type="button" className="l2-good" onClick={() => move(-1, 0)}>←</button>
              <button type="button" className="l2-good" onClick={() => move(1, 0)}>→</button>
            </div>
            <button type="button" className="l2-good" onClick={() => move(0, 1)}>↓</button>
          </div>
        </div>
      </div>

      <p className="l2-progress">
        Обезврежено угроз: {Object.keys(resolved).length} / {checkpoints.length}
      </p>
      <p className="l2-sub">{hint}</p>

      {activeCheckpointId && curThreat && (
        <div className="l3-threat-overlay" role="dialog" aria-modal="true" aria-labelledby="l3-threat-title">
          <div className="l3-threat-modal">
            <h3 id="l3-threat-title" className="l3-threat-heading">
              {curThreat.title}
            </h3>

            {threatPhase === 'visual1' && (
              <ThreatScreenVisual threat={curThreat} stage={1} onAdvance={() => setThreatPhase('visual2')} />
            )}
            {threatPhase === 'visual2' && (
              <ThreatScreenVisual threat={curThreat} stage={2} onAdvance={() => setThreatPhase('luno')} />
            )}

            {threatPhase === 'luno' && (
              <div className="l3-threat-luno-step">
                <div className="l3-threat-luno-avatar">
                  <div className="avatar-circle l3-threat-luno-avatar-circle">
                    <LunoPhoto urls={LUNO_AVATAR_URLS} className="l3-threat-luno-img" alt="" />
                  </div>
                  <span className="l3-threat-luno-name">Луно</span>
                </div>
                <div className="l3-threat-luno-bubble">
                  {(Array.isArray(curThreat.luno) ? curThreat.luno : [curThreat.luno]).map((line, i) => (
                    <p key={i}>
                      <RichText>{line}</RichText>
                    </p>
                  ))}
                  <button type="button" className="l3-mock-btn-open l3-mock-next-inline" onClick={() => setThreatPhase('quiz')}>
                    Что делать?
                  </button>
                </div>
              </div>
            )}

            {threatPhase === 'quiz' && (
              <>
                <p className="l3-threat-pick">Выбери все подходящие действия:</p>
                <div className="l2-opts">
                  {curOptions.map((o) => (
                    <label key={o} className="l2-opt">
                      <input
                        type="checkbox"
                        checked={selected.includes(o)}
                        onChange={() => toggle(o)}
                      />
                      {o}
                    </label>
                  ))}
                </div>
                {err && <p className="l2-err">{err}</p>}
                <button type="button" className="l2-primary" onClick={submitThreat}>
                  Применить действия
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

function Rules({ onNext }) {
  const slides = [
    [
      '**— Есть универсальные правила безопасного поведения.**',
      'Если вы будете их соблюдать, риск заражения станет намного ниже.',
      'Общие правила:',
    ],
    [
      '**1. Скачивай файлы только из надёжных источников.**',
      '— Используй официальные сайты и проверенные платформы.',
      '— Не доверяй «бесплатным версиям» и неизвестным ссылкам.',
    ],
    [
      '**2. Не открывай подозрительные файлы и ссылки.**',
      '— Особенно если они пришли от незнакомых людей.',
      '— Используй VirusTotal для проверки наличия вирусов, червей, троянов и других вредоносных програм.',
    ],
    ['**3. Используй хороший антивирус — далеко не все действительно помогают.**'],
    [
      '**4. Обновляй систему и приложения.**',
      '— Обновления закрывают уязвимости, которыми пользуются вирусы.',
    ],
    [
      '**5. Не устанавливай сомнительные программы.**',
      '— Обращай внимание на: название, источник, разрешения.',
    ],
    ['**6. Проверяй, какие доступы запрашивает приложение.**'],
    [
      '**7. Не вводи данные на подозрительных сайтах.**',
      '— Пароли и личную информацию вводи только на проверенных ресурсах.',
    ],
    [
      '**8. Будь внимателен к поведению устройства.**',
      '— Если оно тормозит, появляются окна, что-то открывается само — это может быть признаком вируса.',
    ],
  ]
  const [idx, setIdx] = useState(0)
  const isLast = idx >= slides.length - 1
  return (
    <div className="l2-card l3-rules-card">
      <h2 className="l2-title">Универсальные правила</h2>
      <div className="dialogue-section l3-rules-section">
        <div className="character-avatar l3-rules-avatar-wrap">
          <div className="avatar-circle l3-rules-avatar-circle">
            <LunoPhoto urls={LUNO_AVATAR_URLS} className="l3-rules-luno-photo" alt="" />
          </div>
          <div className="character-name">Луно</div>
        </div>
        <div className="dialogue-bubble l3-rules-bubble">
          <div className="l3-rules-body">
            {slides[idx].map((line) => (
              <p key={line}>
                <RichText>{line}</RichText>
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="l3-slide-actions">
        {idx > 0 && (
          <button type="button" className="l3-arrow-btn" onClick={() => setIdx((s) => s - 1)} aria-label="Предыдущая реплика">
            ←
          </button>
        )}
        {!isLast ? (
          <button type="button" className="l3-arrow-btn" onClick={() => setIdx((s) => s + 1)} aria-label="Следующая реплика">
            →
          </button>
        ) : (
          <button type="button" className="l2-primary" onClick={onNext}>Далее</button>
        )}
      </div>
    </div>
  )
}

function questionPrompt(q) {
  if (q.matchIntro) return q.matchIntro
  return q.q
}

function Level3Test({ onComplete }) {
  const [ans, setAns] = useState({})
  const [fills, setFills] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState('')
  const shuffledQuestions = useMemo(
    () => level3TestQuestions.map((q) => ({ ...q, o: shuffleArray(q.o) })),
    [],
  )
  const shuffledFillTasks = useMemo(
    () => level3FillTasks.map((task) => ({ ...task, bank: shuffleArray(task.bank) })),
    [],
  )

  const toggle = (k, v, multi) => {
    setAns((a) => {
      const cur = a[k] || []
      if (!multi) return { ...a, [k]: [v] }
      return { ...a, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })
  }

  const okMain = shuffledQuestions.every((q, i) => {
    const a = ans[i] || []
    return q.type === 'single' ? a[0] === q.c[0] : arraysEqualAsSets(a, q.c)
  })
  const okFill = level3FillTasks.every((task, ti) =>
    task.answers.every((x, i) => (fills[`${ti}_${i}`] || '') === x),
  )
  const allOk = submitted && okMain && okFill
  const totalSteps = shuffledQuestions.length + shuffledFillTasks.length
  const isQuestionStep = step < shuffledQuestions.length

  const checkAll = () => {
    const wrongQ = shuffledQuestions.findIndex((q, i) => {
      const a = ans[i] || []
      return q.type === 'single' ? a[0] !== q.c[0] : !arraysEqualAsSets(a, q.c)
    })
    if (wrongQ !== -1) {
      setSubmitted(true)
      setStep(wrongQ)
      return
    }
    const wrongFill = level3FillTasks.findIndex((task, ti) =>
      task.answers.some((x, i) => (fills[`${ti}_${i}`] || '') !== x),
    )
    if (wrongFill !== -1) {
      setSubmitted(true)
      setStep(shuffledQuestions.length + wrongFill)
      return
    }
    setSubmitted(true)
  }

  const canGoNext = () => {
    if (isQuestionStep) {
      const q = shuffledQuestions[step]
      const a = ans[step] || []
      return q.type === 'single' ? a[0] === q.c[0] : arraysEqualAsSets(a, q.c)
    }
    const fillIdx = step - shuffledQuestions.length
    const task = level3FillTasks[fillIdx]
    return task.answers.every((x, i) => (fills[`${fillIdx}_${i}`] || '') === x)
  }

  const nextStep = () => {
    if (!canGoNext()) {
      setStepError('Неверно. Исправь ответ, чтобы перейти дальше.')
      return
    }
    setStepError('')
    setStep((s) => s + 1)
  }

  const curQ = isQuestionStep ? shuffledQuestions[step] : null

  return (
    <div className="l2-card l3-test-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-progress">Шаг {step + 1} из {totalSteps}</p>
      {isQuestionStep && curQ && (
        <div className="l2-q">
          <p className="l2-q-title l3-test-q-title">{questionPrompt(curQ)}</p>
          {curQ.leftCol && curQ.rightCol && (
            <div className="l3-match-block" aria-label="Условия и варианты">
              <ul className="l3-match-col">
                {curQ.leftCol.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="l3-match-gap" aria-hidden />
              <ul className="l3-match-col">
                {curQ.rightCol.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="l2-opts">
            {curQ.o.map((o) => (
              <label key={o} className="l2-opt">
                <input
                  type={curQ.type === 'single' ? 'radio' : 'checkbox'}
                  name={`q_${step}`}
                  checked={(ans[step] || []).includes(o)}
                  onChange={() => {
                    setStepError('')
                    toggle(step, o, curQ.type === 'multi')
                  }}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      )}
      {!isQuestionStep && (
        <div className="l2-q">
          {(() => {
            const fillIdx = step - shuffledQuestions.length
            const task = shuffledFillTasks[fillIdx]
            return (
              <>
                <p className="l2-q-title">{task.title}</p>
                <p className="l2-sub">Слова: {task.bank.join(', ')}</p>
                {task.lines.map((line, i) => (
                  <p key={i} className="l-test-fill-line">
                    {line[0]}{' '}
                    <select
                      value={fills[`${fillIdx}_${i}`] || ''}
                      onChange={(e) => {
                        setStepError('')
                        setFills({ ...fills, [`${fillIdx}_${i}`]: e.target.value })
                      }}
                    >
                      <option value="">— выберите —</option>
                      {task.bank.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>{' '}
                    {line[1]}
                  </p>
                ))}
              </>
            )
          })()}
        </div>
      )}
      <div className="l2-test-nav">
        {step > 0 && (
          <button type="button" className="back-button" onClick={() => setStep((s) => s - 1)}>
            Назад
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button type="button" className="l2-primary" onClick={nextStep}>
            Далее
          </button>
        ) : (
          <button type="button" className="l2-primary" onClick={checkAll}>
            Проверить
          </button>
        )}
      </div>
      {stepError && <p className="l2-err">{stepError}</p>}
      {submitted && !allOk && <p className="l2-err">Есть ошибки. Исправь и проверь снова.</p>}
      {allOk && (
        <LunoVictoryScreen
          title="Уровень 3 пройден!"
          onContinue={onComplete}
          continueLabel="К выбору уровней"
          lunoAvatarUrls={LUNO_AVATAR_URLS}
        >
          <p>
            <RichText>
              Отлично! Ты закрепил **правила цифровой безопасности**.
            </RichText>
          </p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}

export function Level3Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelState(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < level3Flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const save = (n) => {
    setStep(n)
    if (user) setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => save(step + 1)
  const prev = () => save(Math.max(0, step - 1))

  const finish = async () => {
    if (user) {
      await Promise.all([
        unlockNextLevel(user.uid, 4),
        completeLevelInDb(user.uid, LEVEL_ID),
        setLevelStep(user.uid, LEVEL_ID, 0),
      ])
    }
    navigate('/levels')
  }

  const item = level3Flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = level3Flow.length
  const teacherExitPreview = () => navigate('/levels')

  const prevBtn = step > 0 && (
    <div className="scenario-prev-wrap">
      <button type="button" className="scenario-prev-btn" onClick={prev}>
        ← Предыдущий шаг сценария
      </button>
    </div>
  )

  const teacherSkip = !roleLoading && (
    <TeacherStepSkip
      isTeacher={isTeacher}
      isLastStep={step >= flowLen - 1}
      onSkipStep={next}
      onEndPreview={teacherExitPreview}
    />
  )

  const isCinematicDialogue = item.type === 'dialogue' && item.bgKey

  if (item.type === 'scene2popups') {
    return (
      <>
        <Level3Scene2Popups onNext={next} flowStep={step} />
        {teacherSkip}
      </>
    )
  }

  if (item.type === 'fullscreenCongrats') {
    return (
      <div className="level-page level-page--l3-fullscreen-page">
        <button
          type="button"
          className="l3-fullscreen-congrats"
          onClick={next}
        >
          <span className="l3-fullscreen-congrats-line">
            <RichText>{item.line}</RichText>
          </span>
          <span className="l3-fullscreen-congrats-hint">Нажми, чтобы продолжить</span>
        </button>
        {teacherSkip}
      </div>
    )
  }

  if (item.type === 'preTestVictory') {
    return (
      <>
        <LunoVictoryScreen
          title="Готово!"
          onContinue={next}
          continueLabel="К тесту"
          lunoAvatarUrls={LUNO_AVATAR_URLS}
        >
          <p>
            <RichText>Проверь знания в **коротком тесте**.</RichText>
          </p>
        </LunoVictoryScreen>
        {teacherSkip}
      </>
    )
  }

  if (isCinematicDialogue) {
    return (
      <div className="level-page level-page--l3 level-page--l1-cinematic">
        <div className="l1-cinematic-root">
          {/* key=step: при повторяющемся bgKey (несколько диалогов на scene3) сбрасываем попытки загрузки */}
          <Level3Backdrop key={step} bgKey={item.bgKey} />
          <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
            <div className="level-header">
              <button type="button" className="back-button" onClick={() => navigate('/levels')}>
                ← Назад
              </button>
              <h1>{LEVEL3_TITLE}</h1>
            </div>
            {prevBtn}
          </div>
          <div
            className="l1-cinematic-body l1-cinematic-body--dialogue"
            onClick={next}
            role="presentation"
          >
            <div className="dialogue-section l1-dialogue-cinematic">
              <div className="dialogue-bubble l1-dialogue-bubble-glass">
                <p className="l1-dialogue-speaker">{item.character}</p>
                <DialogueLines text={item.text} />
              </div>
              <div className="level-actions l1-cinematic-actions">
                <button
                  type="button"
                  className="next-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                >
                  Далее →
                </button>
                <p className="l1-tap-hint">или щёлкни по экрану</p>
              </div>
            </div>
          </div>
        </div>
        {teacherSkip}
      </div>
    )
  }

  return (
    <div className="level-page level-page--l3">
      <div className="level-container l2-wide">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{LEVEL3_TITLE}</h1>
        </div>
        {prevBtn}

        {item.type === 'splash' && (
          <GameSplashScreen
            title={item.title}
            paragraphs={item.paragraphs}
            buttonText={item.buttonText}
            onContinue={next}
            lunoAvatarUrls={LUNO_AVATAR_URLS}
          />
        )}

        {item.type === 'theory' && (
          <Level3TheoryCarousel lunoAvatarUrls={LUNO_AVATAR_URLS} onNext={next} />
        )}
        {item.type === 'maze' && <MazeGame onNext={next} />}
        {item.type === 'rules' && <Rules onNext={next} />}
        {item.type === 'safepc' && (
          <Level3SafePc onNext={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />
        )}
        {item.type === 'test' && <Level3Test onComplete={finish} />}
      </div>
      {teacherSkip}
    </div>
  )
}
