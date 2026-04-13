import { CharacterAvatar } from './CharacterAvatar'
import './LunoVictoryScreen.css'

export function LunoVictoryScreen({ title, children, onContinue, continueLabel = 'Вперёд' }) {
  return (
    <div className="luno-victory">
      <div className="luno-victory-backdrop" aria-hidden />
      <div className="luno-victory-inner">
        <div className="luno-victory-mascot" aria-hidden="true">
          <CharacterAvatar name="Луно" className="luno-victory-avatar" />
        </div>
        <div className="luno-victory-right">
          {title ? <h2 className="luno-victory-title">{title}</h2> : null}
          <div className="luno-victory-bubble">{children}</div>
          <button type="button" className="luno-victory-btn" onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
