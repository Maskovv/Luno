import lunoSvg from '../assets/avatars/luno.svg'
import mashaSvg from '../assets/avatars/masha.svg'
import vanyaSvg from '../assets/avatars/vanya.svg'

const byName = {
  Луно: lunoSvg,
  Маша: mashaSvg,
  Ваня: vanyaSvg,
  Гид: lunoSvg,
}

export function CharacterAvatar({ name, className = '' }) {
  const src = byName[name] || lunoSvg
  return (
    <div className={`ch-avatar ${className}`}>
      <img className="ch-avatar-img" src={src} alt={name} />
    </div>
  )
}

