import scene1Jpg from './assets/scene_1.jpg?url'
import scene2Jpg from './assets/scene_2.jpg?url'
import scene3Jpg from './assets/scene_3.jpg?url'

export function level4PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
}

const SCENES = {
  scene1: [scene1Jpg, 'level4/scene_1.jpg', 'level4/Scene_1.jpg'],
  scene2: [scene2Jpg, 'level4/scene_2.jpg', 'level4/Scene_2.jpg'],
  scene3: [scene3Jpg, 'level4/scene_3.jpg', 'level4/Scene_3.jpg'],
}

export function level4UrlsForScene(bgKey) {
  const list = SCENES[bgKey]
  if (!list) return []
  return list.map((p) => (typeof p === 'string' ? level4PublicUrl(p) : p))
}
