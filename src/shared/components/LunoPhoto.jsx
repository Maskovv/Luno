import { useEffect, useState } from 'react'
import { CharacterAvatar } from './CharacterAvatar'

/**
 * Аватар Луно из набора URL (как в level1: luno-avatar.png.jpg …).
 * При ошибке загрузки переключается на следующий URL, затем на SVG CharacterAvatar.
 */
export function LunoPhoto({ urls, className = '', alt = '' }) {
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [urls])

  if (!urls?.length) {
    return <CharacterAvatar name="Луно" className={className} />
  }

  const src = urls[attempt]
  if (attempt >= urls.length || !src) {
    return <CharacterAvatar name="Луно" className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setAttempt((a) => a + 1)}
    />
  )
}
