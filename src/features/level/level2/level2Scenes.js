/**
 * Фоны уровня 2 — public/level2/
 * import.meta.env.BASE_URL учитывается для деплоя не в корне.
 */

export function level2PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
}

const SCENE_KEYS = {
  scene1: ['level2/scene_1.jpg', 'level2/scene_1.png', 'level2/scene_1.webp'],
  scene2: ['level2/scene_2.jpg', 'level2/scene_2.png', 'level2/scene_2.webp'],
  scene3: ['level2/scene_3.jpg', 'level2/scene_3.png', 'level2/scene_3.webp'],
}

export function level2UrlsForScene(bgKey) {
  const list = SCENE_KEYS[bgKey]
  if (!list) return []
  return list.map(level2PublicUrl)
}
