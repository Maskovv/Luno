/**
 * Фоны и аватары уровня 1 — файлы в public/level1/
 * Путь собирается с import.meta.env.BASE_URL (нужно при base !== '/' на хостинге).
 * Для каждого ключа — несколько имён файла (onError переключает на следующее).
 */

/** Путь относительно public: "level1/scene-01.png.jpg" */
export function level1PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
}

const BG_VARIANTS = {
  mashaAlone: ['level1/scene-01.png.jpg', 'level1/scene-01.jpg', 'level1/scene-01.png'],
  corridorBoth: ['level1/scene-02.png.jpg', 'level1/scene-02.jpg', 'level1/scene-02.png'],
  mashaShowsPhone: ['level1/scene-03.png.jpg', 'level1/scene-03.jpg', 'level1/scene-03.png'],
  lunoHologram: ['level1/scene-04.png.jpg', 'level1/scene-04.jpg', 'level1/scene-04.png'],
  vanyaLunoClose: ['level1/scene-05.png.jpg', 'level1/scene-05.jpg', 'level1/scene-05.png'],
  glitchPhone: ['level1/scene-07.png.jpg', 'level1/scene-07.jpg', 'level1/scene-07.png'],
  corridorTense: ['level1/scene-09.png.jpg', 'level1/scene-09.jpg', 'level1/scene-09.png'],
  bothCalmLuno: ['level1/scene-10.png.jpg', 'level1/scene-10.jpg', 'level1/scene-10.png'],
}

export function level1UrlsForBg(bgKey) {
  const list = BG_VARIANTS[bgKey]
  if (!list) return []
  return list.map(level1PublicUrl)
}

/** Первый URL (для отладки / совместимости) */
export const LEVEL1_BG = Object.fromEntries(
  Object.entries(BG_VARIANTS).map(([k, paths]) => [k, level1PublicUrl(paths[0])]),
)

const LUNO_VARIANTS = [
  'level1/luno-avatar.png.jpg',
  'level1/luno-avatar.jpg',
  'level1/luno-avatar.png',
]
const MASHA_VARIANTS = [
  'level1/Avatar.png.jpg',
  'level1/avatar.png.jpg',
  'level1/Avatar.jpg',
  'level1/avatar.jpg',
]

export const LUNO_AVATAR_URLS = LUNO_VARIANTS.map(level1PublicUrl)
export const MASHA_AVATAR_URLS = MASHA_VARIANTS.map(level1PublicUrl)

/** @deprecated используйте LUNO_AVATAR_URLS[0] */
export const LUNO_AVATAR_SRC = LUNO_AVATAR_URLS[0]
/** @deprecated */
export const MASHA_AVATAR_SRC = MASHA_AVATAR_URLS[0]
