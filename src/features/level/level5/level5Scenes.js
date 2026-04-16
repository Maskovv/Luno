/**
 * Фоны level5 и аватары — файлы в public/level5/ (Vanya.jpg, Anya.jpg, scene_1…4).
 * Сцены 3 и 4 в сценарии не разводим: везде используется только scene4 → scene_4.jpg.
 */

/** Подними при замене картинок в public/level5 — иначе CDN/браузер могут отдавать старый файл. */
const LEVEL5_CACHE_BUST = '20250417'

export function level5PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  let url = `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
  if (normalized.startsWith('level5/')) {
    const sep = url.includes('?') ? '&' : '?'
    url = `${url}${sep}v=${LEVEL5_CACHE_BUST}`
  }
  return url
}

const SCENES = {
  scene1: ['level5/scene_1.jpg', 'level5/scene1.jpg', 'level5/Scene_1.jpg'],
  scene2: ['level5/scene_2.jpg', 'level5/scene2.jpg', 'level5/Scene_2.jpg'],
  scene4: ['level5/scene_4.jpg', 'level5/scene4.jpg', 'level5/Scene_4.jpg'],
}

export function level5UrlsForScene(bgKey) {
  const list = SCENES[bgKey]
  if (!list) return []
  return list.map(level5PublicUrl)
}

export const VANYA_LEVEL5_URLS = ['level5/Vanya.jpg', 'level5/vanya.jpg'].map(level5PublicUrl)
export const ANYA_LEVEL5_URLS = ['level5/Anya.jpg', 'level5/anya.jpg'].map(level5PublicUrl)
