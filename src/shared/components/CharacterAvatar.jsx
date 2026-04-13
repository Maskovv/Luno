import lunoSvg from '../assets/avatars/luno.svg'
import mashaSvg from '../assets/avatars/masha.svg'
import vanyaSvg from '../assets/avatars/vanya.svg'

const byName = {
  Луно: lunoSvg,
  Маша: mashaSvg,
  Ваня: vanyaSvg,
  Мошенник: vanyaSvg,
  Тролль: mashaSvg,
  Рассказчик: lunoSvg,
  Пользователь: vanyaSvg,
  Дима: vanyaSvg,
  Даня: mashaSvg,
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

