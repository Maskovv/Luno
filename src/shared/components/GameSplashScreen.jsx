import { CharacterAvatar } from './CharacterAvatar'
import { LunoPhoto } from './LunoPhoto'
import { RichText } from './RichText'
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
  /** Один URL аватара Луно (устарело — используйте lunoAvatarUrls) */
  lunoAvatarSrc,
  /** Несколько URL с fallback (как в level1) */
  lunoAvatarUrls,
}) {
  const photoUrls = lunoAvatarUrls?.length ? lunoAvatarUrls : lunoAvatarSrc ? [lunoAvatarSrc] : null

  return (
    <div className="game-splash">
      <div className="game-splash-card">
        <div className="game-splash-hero">
          <div className="game-splash-avatar-wrap">
            {photoUrls?.length ? (
              <LunoPhoto urls={photoUrls} className="game-splash-avatar game-splash-avatar--custom" alt="" />
            ) : (
              <CharacterAvatar name="Луно" className="game-splash-avatar" />
            )}
          </div>
          <div className="game-splash-copy">
            <h2 className="game-splash-title">{title}</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="game-splash-p">
                <RichText>{p}</RichText>
              </p>
            ))}
            {bullets.length > 0 && (
              <ul className="game-splash-bullets">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <RichText>{b}</RichText>
                  </li>
                ))}
              </ul>
            )}
            {closing ? (
              <p className="game-splash-p game-splash-closing">
                <RichText>{closing}</RichText>
              </p>
            ) : null}
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
