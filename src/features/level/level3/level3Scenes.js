/**
 * Картинки сцен подключаются через import (?url), чтобы Vite положил их в dist/assets/
 * с корректными URL — так они гарантированно грузятся на Firebase и не зависят только от public/.
 */
import scene1Jpg from './assets/scene_1.jpg?url'
import scene2Jpg from './assets/scene_2.jpg?url'
import scene3Jpg from './assets/scene_3.jpg?url'
import scene1Svg from './assets/scene_1.svg?url'
import scene2Svg from './assets/scene_2.svg?url'
import scene3Svg from './assets/scene_3.svg?url'

export function level3PublicUrl(pathFromPublic) {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalized = pathFromPublic.startsWith('/') ? pathFromPublic.slice(1) : pathFromPublic
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1')
}

/** JPG первым; SVG — если декодирование jpg когда-то упадёт */
const SCENES = {
  scene1: [scene1Jpg, scene1Svg],
  scene2: [scene2Jpg, scene2Svg],
  scene3: [scene3Jpg, scene3Svg],
}

export function level3UrlsForScene(bgKey) {
  const list = SCENES[bgKey]
  if (!list) return []
  return list
}
