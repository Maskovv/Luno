import { CharacterAvatar } from './CharacterAvatar'
import './GameSplashScreen.css'

/**
 * Экран перед мини-игрой: Луно + заголовок + текст + кнопка с логичным названием.
 */
export function GameSplashScreen({
  title,
  paragraphs = [],
  bullets = [],
  closing,
  buttonText,
  onContinue,
}) {
  return (
    <div className="game-splash">
      <div className="game-splash-card">
        <div className="game-splash-hero">
          <div className="game-splash-avatar-wrap">
            <CharacterAvatar name="Луно" className="game-splash-avatar" />
          </div>
          <div className="game-splash-copy">
            <h2 className="game-splash-title">{title}</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="game-splash-p">
                {p}
              </p>
            ))}
            {bullets.length > 0 && (
              <ul className="game-splash-bullets">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {closing ? <p className="game-splash-p game-splash-closing">{closing}</p> : null}
          </div>
        </div>
        <div className="game-splash-actions">
          <button type="button" className="game-splash-btn" onClick={onContinue}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
