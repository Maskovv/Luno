/**
 * Фоны level5 и аватары — файлы в public/level5/ (Vanya.jpg, Anya.jpg, scene_1…4).
 */

export function level5PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
}

const SCENES = {
  scene1: ['level5/scene_1.jpg', 'level5/scene1.jpg', 'level5/Scene_1.jpg'],
  scene2: ['level5/scene_2.jpg', 'level5/scene2.jpg', 'level5/Scene_2.jpg'],
  scene3: ['level5/scene_3.jpg', 'level5/scene3.jpg', 'level5/Scene_3.jpg'],
  scene4: ['level5/scene_4.jpg', 'level5/scene4.jpg', 'level5/Scene_4.jpg'],
}

export function level5UrlsForScene(bgKey) {
  const list = SCENES[bgKey]
  if (!list) return []
  return list.map(level5PublicUrl)
}

export const VANYA_LEVEL5_URLS = ['level5/Vanya.jpg', 'level5/vanya.jpg'].map(level5PublicUrl)
export const ANYA_LEVEL5_URLS = ['level5/Anya.jpg', 'level5/anya.jpg'].map(level5PublicUrl)
