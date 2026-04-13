/**
 * Лабиринт 7×7: horiz[y][x] — стена снизу от (x,y); vert[y][x] — стена справа от (x,y).
 * horiz: y = 0..MAZE_SIZE-2, x = 0..MAZE_SIZE-1; vert[y][x]: x=0..MAZE_SIZE-2 — между столбцами, x=MAZE_SIZE-1 — восточная грань столбца x.
 * Внешние границы: лево и право; сверху открыт (0,0); снизу открыт только (6,6).
 */

export const MAZE_SIZE = 7

/** Увеличивай при правках таблиц — key сетки в Level3Maze. */
export const MAZE_SPEC_REVISION = 8

function emptyHoriz() {
  return Array.from({ length: MAZE_SIZE - 1 }, () => Array(MAZE_SIZE).fill(false))
}

function emptyVert() {
  return Array.from({ length: MAZE_SIZE }, () => Array(MAZE_SIZE).fill(false))
}

const LAST = MAZE_SIZE - 1

/**
 * Внутренние стены по схеме (0-based).
 * vertRight[x] — стена справа от столбца x; x = MAZE_SIZE-1 — сегменты восточной внешней границы (vert[y][LAST]).
 */
export function buildMazeWalls() {
  const horiz = emptyHoriz()
  const vert = emptyVert()

  const horizBelow = {
    0: [1, 2, 4, 5],
    1: [1, 4],
    2: [1, 2, 4, 5],
    3: [2, 3],
    4: [0, 1, 2, 4, 5, 6],
    5: [0, 1, 3, 4],
  }

  const vertRight = {
    0: [1, 2, 4],
    1: [0, 1, 2, 3, 4, 5, 6],
    2: [],
    3: [0, 1, 2, 4, 5, 6],
    4: [0, 1, 4, 5, 6],
    5: [0, 1, 2, 3, 4, 5, 6],
    6: [0, 1, 2, 3, 4, 5, 6],
  }

  Object.entries(horizBelow).forEach(([y, cols]) => {
    const yi = Number(y)
    cols.forEach((x) => {
      if (x < MAZE_SIZE && yi < MAZE_SIZE - 1) horiz[yi][x] = true
    })
  })

  Object.entries(vertRight).forEach(([x, rows]) => {
    const xi = Number(x)
    if (xi < 0 || xi >= MAZE_SIZE) return
    rows.forEach((y) => {
      if (y < MAZE_SIZE) vert[y][xi] = true
    })
  })

  return { horiz, vert }
}

export function canMoveFrom(x, y, dx, dy, horiz, vert) {
  const nx = x + dx
  const ny = y + dy
  if (nx < 0 || nx >= MAZE_SIZE || ny < 0 || ny >= MAZE_SIZE) {
    if (x === LAST && y === LAST && dx === 0 && dy === 1) return false
    return false
  }

  if (dx === 1 && dy === 0) {
    if (x === LAST) return false
    return !vert[y][x]
  }
  if (dx === -1 && dy === 0) {
    if (x === 0) return false
    return !vert[y][x - 1]
  }
  if (dx === 0 && dy === 1) {
    if (y === LAST) return false
    return !horiz[y][x]
  }
  if (dx === 0 && dy === -1) {
    if (y === 0) return false
    return !horiz[y - 1][x]
  }
  return false
}

export function getCellWalls(x, y, horiz, vert) {
  const top = y === 0 ? x > 0 : horiz[y - 1][x]
  const bottom = y === LAST ? x < LAST : horiz[y][x]
  const left = x === 0 ? true : vert[y][x - 1]
  const right = x === LAST ? vert[y][LAST] : vert[y][x]
  return { top, right, bottom, left }
}

export function getCellDrawEdges(x, y, horiz, vert) {
  return {
    top: y === 0 && x > 0,
    right: x < LAST ? vert[y][x] : vert[y][LAST],
    bottom: y < LAST ? horiz[y][x] : x < LAST,
    left: x === 0,
  }
}

export function bfsPath(horiz, vert) {
  const start = [0, 0]
  const goal = [LAST, LAST]
  const key = (a, b) => `${a},${b}`
  const q = [start]
  const prev = new Map()
  prev.set(key(0, 0), null)
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  while (q.length) {
    const [x, y] = q.shift()
    if (x === goal[0] && y === goal[1]) {
      const path = []
      let cur = key(x, y)
      while (cur) {
        const [cx, cy] = cur.split(',').map(Number)
        path.push([cx, cy])
        cur = prev.get(cur)
      }
      return path.reverse()
    }
    for (const [dx, dy] of dirs) {
      if (!canMoveFrom(x, y, dx, dy, horiz, vert)) continue
      const nx = x + dx
      const ny = y + dy
      const k = key(nx, ny)
      if (prev.has(k)) continue
      prev.set(k, key(x, y))
      q.push([nx, ny])
    }
  }
  return null
}
