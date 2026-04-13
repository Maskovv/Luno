import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import '../LevelPage.css'
import '../level2/level2.css'
import './level3.css'

const LEVEL_ID = '3'
const TITLE = 'Уровень 3. Вирусы и вредоносные программы'

const flow = [
  { t: 'd', c: 'Ваня', x: '— О, я наконец-то нашёл игру, в которою сейчас все друзья играют! Сейчас скачаю!' },
  { t: 'd', c: 'Ваня', x: 'Скачивает файл. Экран «глючит».' },
  { t: 'd', c: 'Дима', x: '— А ты уверен, что с этого сайта можно скачивать? Сайт выглядит подозрительно…помнишь, что Луно говорил…' },
  { t: 'd', c: 'Дима', x: 'Появляются всплывающие окна, реклама, зависания. — Вань… у тебя что-то странное происходит…' },
  { t: 'd', c: 'Луно', x: ['— Похоже, на устройство попала вредоносная программа.', '— Такие программы называются вирусами.'] },
  { t: 'theory' },
  { t: 'maze' },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— Поздравляю! 🎉',
      'Теперь вы знаете, как защитить себя от вирусов.',
      '— Помните:',
      'ваши знания могут помочь не только вам, но и вашим друзьям.',
      '— Делитесь ими и будьте внимательны в интернете.',
    ],
  },
  { t: 'rules' },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— Сейчас вы попробуете настроить безопасность устройства на практике.',
      '— Ваша задача — сделать компьютер максимально защищённым.',
    ],
  },
  { t: 'safepc' },
  { t: 'test' },
]

const virusCards = [
  {
    title: '1) Вирус',
    desc: 'Прикрепляется к файлам и распространяется вместе с ними.',
    detect: ['устройство работает медленно', 'файлы повреждаются/исчезают', 'программы не запускаются'],
    protect: ['не скачивать с неизвестных сайтов', 'проверять файлы (например, VirusTotal)', 'использовать антивирус'],
  },
  {
    title: '2) Шпионская программа',
    desc: 'Собирает данные без вашего ведома (пароли, действия, сообщения).',
    detect: ['подозрительные входы', 'быстрый разряд батареи', 'слишком точная реклама'],
    protect: ['проверять доступы приложения', 'удалять подозрительные приложения', 'менять пароли'],
  },
  {
    title: '3) Программа-вымогатель',
    desc: 'Блокирует устройство/файлы и требует оплату.',
    detect: ['файлы не открываются', 'требование оплаты', 'блокировка устройства'],
    protect: ['не платить', 'обратиться к взрослым', 'делать резервные копии'],
  },
  {
    title: '4) Рекламное ПО',
    desc: 'Навязчивая реклама, лишние вкладки и перенаправления.',
    detect: ['слишком много рекламы', 'браузер сам открывает сайты', 'меняется стартовая страница'],
    protect: ['не ставить сомнительные расширения', 'не нажимать попапы', 'очистить и сбросить браузер'],
  },
  {
    title: '5) Троян',
    desc: 'Маскируется под полезную программу, но внутри угроза.',
    detect: ['антивирус отключается', 'устройство тормозит', 'файлы ведут себя странно'],
    protect: ['ставить только из проверенных источников', 'обновлять ПО', 'использовать антивирус'],
  },
]

const threats = [
  {
    id: 'virus',
    title: '🦠 Вирус: game_free.exe',
    text: 'После запуска игра не открылась, устройство тормозит, файлы не открываются.',
    ok: [
      'запустить полную проверку устройства',
      'найти и удалить недавно скачанный файл',
      'временно отключиться от интернета до проверки',
    ],
    bad: ['просто перезагрузить устройство', 'удалить только ярлык', 'запустить файл ещё раз'],
  },
  {
    id: 'spy',
    title: '🕵 Шпионская программа',
    text: 'Приложение запросило полный доступ, пошли уведомления о входе, устройство быстро садится.',
    ok: ['удалить подозрительное приложение', 'сменить пароли', 'ограничить лишние доступы'],
    bad: ['разрешить всё', 'игнорировать уведомления', 'ничего не делать'],
  },
  {
    id: 'ransom',
    title: '💸 Вымогатель: bonus.zip',
    text: 'На экране: «Ваши файлы зашифрованы. Заплатите за восстановление».',
    ok: ['не платить', 'обратиться к взрослым', 'отключить сеть и проверить устройство'],
    bad: ['оплатить', 'нажимать всё подряд', 'ждать пока само пройдёт'],
  },
  {
    id: 'adware',
    title: '📢 Рекламное ПО',
    text: 'После «расширения для браузера» пошли всплывающие окна и лишние вкладки.',
    ok: ['удалить расширение', 'сбросить настройки браузера', 'очистить браузер'],
    bad: ['кликать рекламу, чтобы закрыть', 'переходить по баннерам', 'игнорировать'],
  },
  {
    id: 'trojan',
    title: '🐴 Троян: Minecraft_бесплатно.exe',
    text: 'Файл установился, но не работает, антивирус отключился, устройство тормозит.',
    ok: ['удалить программу', 'запустить антивирус', 'обновить систему и дальше качать только из официальных источников'],
    bad: ['доверять, раз без ошибок установилось', 'ничего не удалять', 'качать ещё с другого неизвестного сайта'],
  },
]

const test = [
  {
    type: 'multi',
    q: '1) Ваня скачал game_update.exe. Программа не открылась, компьютер тормозит. Какие выводы верны?',
    o: ['файл мог содержать вирус', 'проблема в интернете', 'файл мог повредить систему', 'это нормальное поведение программы'],
    c: ['файл мог содержать вирус', 'файл мог повредить систему'],
  },
  {
    type: 'multi',
    q: '2) Почему трояны особенно опасны?',
    o: ['они сразу блокируют устройство', 'маскируются под полезные программы', 'пользователь сам запускает их', 'всегда показывают рекламу'],
    c: ['маскируются под полезные программы', 'пользователь сам запускает их'],
  },
  {
    type: 'single',
    q: '3) Установи соответствие: 1. Собирает данные 2. Показывает рекламу 3. Блокирует файлы; а) рекламное ПО б) вымогатель в) шпионская программа',
    o: ['1-в, 2-а, 3-б', '1-а, 2-б, 3-в', '1-б, 2-в, 3-а'],
    c: ['1-в, 2-а, 3-б'],
  },
  {
    type: 'multi',
    q: '4) Какие действия снижают риск заражения?',
    o: [
      'проверять файлы перед открытием',
      'скачивать с проверенных источников',
      'ставить приложение с сайта, который посоветовал друг',
      'обновлять систему',
      'проверять файлы в онлайн-сервисах типа VirusTotal',
    ],
    c: [
      'проверять файлы перед открытием',
      'скачивать с проверенных источников',
      'обновлять систему',
      'проверять файлы в онлайн-сервисах типа VirusTotal',
    ],
  },
]

const fillTasks = [
  {
    title: '5) Заполни пропуски',
    lines: [
      ['Даже если файл кажется безопасным, его запуск может', 'угрозу для устройства.'],
      ['Некоторые вредоносные программы могут', 'в системе и долго не проявляться.'],
      ['Трояны маскируются под полезные программы, чтобы пользователь сам дал им', '.'],
      ['Поэтому важно использовать', 'для защиты устройства.'],
    ],
    bank: ['антивирус', 'блокировать', 'создать', 'скрываться', 'удалить', 'разрешение', 'ускорить'],
    answers: ['создать', 'скрываться', 'разрешение', 'антивирус'],
  },
  {
    title: '6) Заполните пропуски, выбрав правильные слова из списка',
    lines: [
      ['Рекламное ПО может', 'работу устройства и вызывать постоянные отвлекающие факторы.'],
      ['Часто оно появляется после', 'программ из ненадёжных источников.'],
      ['Переход по таким рекламным окнам может привести к', 'дополнительных угроз.'],
    ],
    bank: ['появлению', 'ускорять', 'замедлять', 'установки', 'игнорировать', 'удаления'],
    answers: ['замедлять', 'установки', 'появлению'],
  },
  {
    title: '7) Заполните пропуски, выбрав правильные слова из списка',
    lines: [
      ['Программы-вымогатели могут', 'доступ к файлам и требовать оплату за их восстановление.'],
      ['Однако оплата не гарантирует', 'данных.'],
      ['Некоторые пользователи совершают ошибку, пытаясь', 'проблему без проверки системы.'],
    ],
    bank: ['восстановление', 'открыть', 'игнорировать', 'заблокировать', 'решить', 'ускорить'],
    answers: ['заблокировать', 'восстановление', 'решить'],
  },
  {
    title: '8) Заполните пропуски, выбрав правильные слова из списка',
    lines: [
      ['Безопасность устройства зависит не только от программ, но и от', 'пользователя.'],
      ['Даже хороший антивирус не защитит, если человек регулярно', 'подозрительные файлы.'],
      ['Многие угрозы возникают из-за невнимательности и', 'к источникам.'],
      ['Поэтому важно развивать привычку', 'перед каждым действием в интернете.'],
    ],
    bank: ['удаляет', 'скачивает', 'проверять', 'доверия', 'игнорирования', 'действий', 'открывать'],
    answers: ['действий', 'скачивает', 'доверия', 'проверять'],
  },
]

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

function Theory({ onNext }) {
  const [idx, setIdx] = useState(0)
  const cur = virusCards[idx]
  const isLast = idx >= virusCards.length - 1
  const visualTitleById = {
    '1) Вирус': 'Подозрительные файлы',
    '2) Шпионская программа': 'Утечка данных',
    '3) Программа-вымогатель': 'Блокировка экрана',
    '4) Рекламное ПО': 'Навязчивая реклама',
    '5) Троян': 'Фальшивое приложение',
  }
  const visualIconById = {
    '1) Вирус': '🧬',
    '2) Шпионская программа': '🕵️',
    '3) Программа-вымогатель': '🔒',
    '4) Рекламное ПО': '📢',
    '5) Троян': '🐴',
  }
  return (
    <div className="l2-card l3-theory-carousel">
      <h2 className="l2-title">Типы вредоносных программ</h2>
      <div className="l3-slide">
        <div className="l3-slide-copy">
          <div className="l2-cons-title">{cur.title}</div>
          <p className="l3-luno-lead">Луно:</p>
          <p className="l3-luno-line">— {cur.desc}</p>
          <p className="l3-luno-line">— Она может:</p>
          <ul className="l3-luno-list">
            {cur.detect.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="l3-luno-line"><strong>Как защититься:</strong> {cur.protect.join(', ')}</p>
        </div>
        <div className="l3-slide-visual" aria-hidden>
          <div className="l3-slide-device">
            <div className="l3-slide-chip">Признаки угрозы в интернете</div>
            <div className="l3-slide-hero" aria-hidden>{visualIconById[cur.title] || '⚠️'}</div>
            <div className="l3-slide-main">{visualTitleById[cur.title] || 'Проверка безопасности'}</div>
            <div className="l3-slide-mini">Пример {idx + 1} из {virusCards.length}</div>
            <div className="l3-slide-points">
              {cur.detect.slice(0, 2).map((d) => (
                <div key={d}>• {d}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="l3-slide-actions">
        {idx > 0 && (
          <button type="button" className="l3-arrow-btn" onClick={() => setIdx((s) => s - 1)} aria-label="Предыдущий слайд">
            ←
          </button>
        )}
        {!isLast ? (
          <button type="button" className="l3-arrow-btn" onClick={() => setIdx((s) => s + 1)} aria-label="Следующий слайд">
            →
          </button>
        ) : (
          <button type="button" className="l2-primary" onClick={onNext}>
            К игре
          </button>
        )}
      </div>
    </div>
  )
}

function MazeGame({ onNext }) {
  const W = 8
  const H = 8
  const start = { x: 0, y: 0 }
  const finish = { x: 7, y: 7 }

  // Главный маршрут — один «коридор» в одну клетку от левого верхнего до правого нижнего угла.
  // Все 5 угроз стоят только на этом пути. От него отходят тупики (туда можно зайти и вернуться).
  const MAIN_PATH = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [4, 3],
    [5, 3],
    [6, 3],
    [6, 4],
    [6, 5],
    [7, 5],
    [7, 6],
    [7, 7],
  ]

  const DEAD_ENDS = [
    [1, 0],
    [0, 3],
    [0, 4],
    [2, 1], // одна клетка в сторону от (2,2); без (2,0) — иначе обход первой угрозы через (1,0)
    [4, 1],
    [4, 0],
    [4, 4],
    [4, 5],
    [6, 2],
    [6, 1],
    [6, 0],
  ]

  const pathCells = new Set([
    ...MAIN_PATH.map(([x, y]) => `${x},${y}`),
    ...DEAD_ENDS.map(([x, y]) => `${x},${y}`),
  ])

  const walls = new Set()
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const key = `${x},${y}`
      if (!pathCells.has(key)) walls.add(key)
    }
  }

  // 5 угроз — только на главном пути (не в тупиках)
  const checkpoints = [
    { id: 'virus', x: 0, y: 2, icon: '🦠' },
    { id: 'spy', x: 2, y: 2, icon: '🕵' },
    { id: 'ransom', x: 4, y: 2, icon: '💸' },
    { id: 'adware', x: 6, y: 4, icon: '📢' },
    { id: 'trojan', x: 7, y: 6, icon: '🐴' },
  ]

  const [pos, setPos] = useState(start)
  const [visited, setVisited] = useState(new Set([`${start.x},${start.y}`]))
  const [resolved, setResolved] = useState({})
  const [activeThreat, setActiveThreat] = useState(null)
  const [selected, setSelected] = useState([])
  const [err, setErr] = useState('')
  const [hint, setHint] = useState(
    'Коридор к выходу в одну клетку; от него отходят тупики. Обезвредь все 5 угроз на пути к финишу.',
  )
  const [done, setDone] = useState(false)

  const cpMap = useMemo(() => {
    const m = new Map()
    checkpoints.forEach((c) => m.set(`${c.x},${c.y}`, c))
    return m
  }, [])

  const curThreat = threats.find((t) => t.id === activeThreat)
  const curOptions = useMemo(
    () => (curThreat ? shuffleArray([...curThreat.ok, ...curThreat.bad]) : []),
    [curThreat],
  )

  const canMove = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !walls.has(`${x},${y}`)

  const move = (dx, dy) => {
    if (activeThreat) return
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (!canMove(nx, ny)) return
    setPos({ x: nx, y: ny })
    setVisited((v) => new Set([...v, `${nx},${ny}`]))
    const cp = cpMap.get(`${nx},${ny}`)
    if (cp && !resolved[cp.id]) {
      setActiveThreat(cp.id)
      setHint('Опасность обнаружена. Выбери правильные действия.')
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
    setResolved((r) => ({ ...r, [curThreat.id]: true }))
    setActiveThreat(null)
    setHint('Угроза устранена. Продолжай путь к выходу.')
  }

  const allResolved = checkpoints.every((c) => resolved[c.id])

  if (done) {
    return (
      <LunoVictoryScreen title="Отлично!" onContinue={onNext} continueLabel="Вперёд">
        <p>Лабиринт пройден, все угрозы обезврежены.</p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l3-cyber">
      <h2 className="l2-title">Игра 1: Лабиринт угроз</h2>
      <p className="l2-sub">
        Интернет — как лабиринт: есть один путь к выходу в один ряд клеток (от угла до угла), по нему же
        встречаются угрозы; ответвления ведут в тупики. Обезвредь все 5 угроз и дойди до зелёной клетки.
      </p>

      <div className="l3-maze-wrap l3-maze-wrap-side">
        <div className="l3-maze-grid" style={{ gridTemplateColumns: `repeat(${W}, 1fr)` }}>
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

      <p className="l2-progress">
        Обезврежено угроз: {Object.keys(resolved).length} / 5
      </p>
      <p className="l2-sub">{hint}</p>

      {activeThreat && curThreat && (
        <div className="l3-threat-overlay" role="presentation">
          <div className="l3-threat-modal">
          <p><strong>{curThreat.title}</strong></p>
          <p>{curThreat.text}</p>
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
          </div>
        </div>
      )}

      {allResolved && pos.x === finish.x && pos.y === finish.y && null}
    </div>
  )
}

function Rules({ onNext }) {
  const slides = [
    [
      '— Есть универсальные правила безопасного поведения.',
      'Если вы будете их соблюдать, риск заражения станет намного ниже.',
      'Общие правила:',
    ],
    [
      '1. Скачивай файлы только из надёжных источников.',
      '— Используй официальные сайты и проверенные платформы.',
      '— Не доверяй «бесплатным версиям» и неизвестным ссылкам.',
    ],
    [
      '2. Не открывай подозрительные файлы и ссылки.',
      '— Особенно если они пришли от незнакомых людей.',
      '— Используй VirusTotal для проверки наличия вирусов, червей, троянов и других вредоносных програм.',
    ],
    ['3. Используй хороший антивирус, далеко не все действительно поиогают.'],
    [
      '4. Обновляй систему и приложения.',
      '— Обновления закрывают уязвимости, которыми пользуются вирусы.',
    ],
    [
      '5. Не устанавливай сомнительные программы.',
      '— Обращай внимание на: название, источник, разрешения.',
    ],
    ['6. Проверяй, какие доступы запрашивает приложение.'],
    [
      '7. Не вводи данные на подозрительных сайтах.',
      '— Пароли и личную информацию вводи только на проверенных ресурсах.',
    ],
    [
      '8. Будь внимателен к поведению устройства.',
      '— Если оно тормозит, появляются окна, что-то открывается само — это может быть признаком вируса.',
    ],
  ]
  const [idx, setIdx] = useState(0)
  const isLast = idx >= slides.length - 1
  return (
    <div className="l2-card">
      <h2 className="l2-title">Универсальные правила</h2>
      <div className="dialogue-section">
        <div className="character-avatar">
          <div className="avatar-circle l2-avatar-photo"><CharacterAvatar name="Луно" /></div>
          <div className="character-name">Луно</div>
        </div>
        <div className="dialogue-bubble">
          {slides[idx].map((line) => (
            <p key={line}>{line}</p>
          ))}
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
          <button type="button" className="l2-primary" onClick={onNext}>К игре</button>
        )}
      </div>
    </div>
  )
}

function SafePc({ onNext }) {
  const [stage, setStage] = useState(0)
  const [perms, setPerms] = useState({
    camera: true,
    messages: true,
    files: true,
    geo: true,
  })
  const [fileSafe, setFileSafe] = useState({ game: false, hw: false })
  const [antivirusOn, setAntivirusOn] = useState(false)
  const [checkedFiles, setCheckedFiles] = useState({})
  const [appOpen, setAppOpen] = useState('antivirus')
  const donePerms = !perms.camera && !perms.messages && !perms.files && !perms.geo
  const doneFiles = fileSafe.game && fileSafe.hw
  const done = stage >= 5 && donePerms && doneFiles && antivirusOn
  return (
    <div className="l2-card l3-cyber">
      <h2 className="l2-title">Игра 2: Безопасный компьютер</h2>
      <p className="l2-sub">Сделай устройство максимально защищённым.</p>

      <div className="l3-desktop">
        <div className="l3-desktop-icons">
          <button type="button" className={`l3-app ${stage >= 1 ? 'ok' : ''}`} onClick={() => { setAppOpen('antivirus'); setStage((s) => Math.max(s, 1)) }}>🛡 Антивирус</button>
          <button type="button" className={`l3-app ${donePerms ? 'ok' : ''}`} onClick={() => { setAppOpen('settings'); setStage((s) => Math.max(s, 2)) }}>⚙ Настройки</button>
          <button type="button" className={`l3-app ${doneFiles ? 'ok' : ''}`} onClick={() => { setAppOpen('files'); setStage((s) => Math.max(s, 3)) }}>📁 Папка с файлами</button>
          <button type="button" className={`l3-app ${stage >= 5 ? 'ok' : ''}`} onClick={() => { setAppOpen('update'); setStage((s) => Math.max(s, 4)) }}>🔄 Обновление</button>
        </div>
        <div className="l3-desktop-window">
          {appOpen === 'antivirus' && (
            <div className="l3-panel">
              <h3>ДЕЙСТВИЕ 1: АНТИВИРУС</h3>
              <p>Антивирус выключен. Нужно включить антивирус и запустить проверку.</p>
              <button type="button" className="l2-primary" onClick={() => setAntivirusOn(true)}>
                {antivirusOn ? 'Антивирус включен' : 'Включить антивирус'}
              </button>
            </div>
          )}
          {appOpen === 'settings' && (
            <div className="l3-panel">
              <h3>ДЕЙСТВИЕ 2: ПРОВЕРКА ПРИЛОЖЕНИЯ</h3>
              <p>Проверь доступы и отключи лишние.</p>
              {Object.keys(perms).map((k) => (
                <label key={k} className="l2-opt">
                  <input
                    type="checkbox"
                    checked={perms[k]}
                    onChange={(e) => setPerms({ ...perms, [k]: e.target.checked })}
                  />
                  {k}
                </label>
              ))}
            </div>
          )}
          {appOpen === 'files' && (
            <div className="l3-panel">
              <h3>ДЕЙСТВИЕ 3: ПРОВЕРКА ФАЙЛОВ</h3>
              <p>Открой браузер VirusTotal и проверь файлы.</p>
              <div className="l3-file-list">
                {[
                  { id: 'game', name: 'game_free.exe', result: 'обнаружена угроза' },
                  { id: 'hw', name: 'homework.pdf', result: 'файл безопасен' },
                ].map((f) => (
                  <div key={f.id} className="l3-file-row">
                    <span>{f.name}</span>
                    <button
                      type="button"
                      className="l3-file-btn"
                      onClick={() => {
                        setCheckedFiles((prev) => ({ ...prev, [f.id]: true }))
                        if (f.id === 'game') setFileSafe((prev) => ({ ...prev, game: false }))
                        if (f.id === 'hw') setFileSafe((prev) => ({ ...prev, hw: true }))
                      }}
                    >
                      Проверить
                    </button>
                    <span className="l3-file-status">
                      {checkedFiles[f.id] ? f.result : 'не проверен'}
                      {f.id === 'game' && checkedFiles[f.id] && !fileSafe.game && (
                        <button
                          type="button"
                          className="l3-file-btn l3-file-btn-danger"
                          onClick={() => setFileSafe((prev) => ({ ...prev, game: true }))}
                        >
                          Удалить
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {appOpen === 'update' && (
            <div className="l3-panel">
              <h3>ДЕЙСТВИЕ 4: ОБНОВЛЕНИЕ</h3>
              <p>Уведомление: «Доступно обновление системы».</p>
              <button type="button" className="l2-primary" onClick={() => setStage(5)}>
                Обновить систему
              </button>
            </div>
          )}
        </div>
      </div>

      {done ? (
        <LunoVictoryScreen title="Отличная работа!" onContinue={onNext} continueLabel="К игре">
          <p>Вы научились защищать устройство, проверять файлы, контролировать доступы и обновлять систему.</p>
        </LunoVictoryScreen>
      ) : (
        <p className="l2-progress">
          Выполнено: {(antivirusOn ? 1 : 0) + (donePerms ? 1 : 0) + (doneFiles ? 1 : 0) + (stage >= 5 ? 1 : 0)} / 4
        </p>
      )}
    </div>
  )
}

function Test({ onComplete }) {
  const [ans, setAns] = useState({})
  const [fills, setFills] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState('')
  const shuffledQuestions = useMemo(
    () => test.map((q) => ({ ...q, o: shuffleArray(q.o) })),
    [],
  )
  const shuffledFillTasks = useMemo(
    () => fillTasks.map((task) => ({ ...task, bank: shuffleArray(task.bank) })),
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
  const okFill = fillTasks.every((task, ti) =>
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
    const wrongFill = fillTasks.findIndex((task, ti) =>
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
    const task = fillTasks[fillIdx]
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

  return (
    <div className="l2-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-progress">Шаг {step + 1} из {totalSteps}</p>
      {isQuestionStep && (
        <div className="l2-q">
          <p className="l2-q-title">{shuffledQuestions[step].q}</p>
          <div className="l2-opts">
            {shuffledQuestions[step].o.map((o) => (
              <label key={o} className="l2-opt">
                <input
                  type={shuffledQuestions[step].type === 'single' ? 'radio' : 'checkbox'}
                  name={`q_${step}`}
                  checked={(ans[step] || []).includes(o)}
                  onChange={() => {
                    setStepError('')
                    toggle(step, o, shuffledQuestions[step].type === 'multi')
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
                  <p key={i}>
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
        <LunoVictoryScreen title="Уровень 3 пройден!" onContinue={onComplete} continueLabel="К выбору уровней">
          <p>Отлично! Ты закрепил правила цифровой безопасности.</p>
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
      if (state?.step != null && state.step < flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const save = (n) => {
    setStep(n)
    if (user) setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => save(step + 1)
  const prev = () => save(Math.max(0, step - 1))

  const finish = () => {
    if (user) {
      unlockNextLevel(user.uid, 4)
      completeLevelInDb(user.uid, LEVEL_ID)
      setLevelStep(user.uid, LEVEL_ID, 0)
    }
    navigate('/levels')
  }

  const item = flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = flow.length
  const teacherExitPreview = () => navigate('/levels')

  return (
    <div className="level-page">
      <div className="level-container l2-wide">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{TITLE}</h1>
        </div>
        {step > 0 && item.t !== 'd' && (
          <div className="scenario-prev-wrap">
            <button type="button" className="scenario-prev-btn" onClick={prev}>
              ← Предыдущий шаг сценария
            </button>
          </div>
        )}

        {item.t === 'd' && (
          <div className="dialogue-section">
            <div className="character-avatar">
              <div className="avatar-circle l2-avatar-photo"><CharacterAvatar name={item.c} /></div>
              <div className="character-name">{item.c}</div>
            </div>
            <div className="dialogue-bubble">
              {Array.isArray(item.x) ? item.x.map((line, i) => <p key={i}>{line}</p>) : <p>{item.x}</p>}
            </div>
            <div className="level-actions l3-dialog-actions">
              {step > 0 && (
                <button type="button" className="scenario-prev-btn" onClick={prev}>
                  ← Назад
                </button>
              )}
              <button type="button" className="next-button" onClick={next}>Далее →</button>
            </div>
          </div>
        )}
        {item.t === 'theory' && <Theory onNext={next} />}
        {item.t === 'maze' && <MazeGame onNext={next} />}
        {item.t === 'rules' && <Rules onNext={next} />}
        {item.t === 'safepc' && <SafePc onNext={next} />}
        {item.t === 'test' && <Test onComplete={finish} />}
      </div>
      {!roleLoading && (
        <TeacherStepSkip
          isTeacher={isTeacher}
          isLastStep={step >= flowLen - 1}
          onSkipStep={next}
          onEndPreview={teacherExitPreview}
        />
      )}
    </div>
  )
}

