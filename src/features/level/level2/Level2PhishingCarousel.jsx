import { useState } from 'react'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { level2CarouselSlides } from './level2FlowData'
import './level2.css'

function SlideVisual({ variant }) {
  return (
    <div className={`l2-cc-visual l2-cc-visual--${variant}`} aria-hidden="true">
      {variant === 'intro' && (
        <>
          <div className="l2-cc-deco l2-cc-deco-a" />
          <div className="l2-cc-deco l2-cc-deco-b" />
          <div className="l2-cc-shield">🛡️</div>
          <div className="l2-cc-wave" />
        </>
      )}
      {variant === 'url' && (
        <div className="l2-cc-browser">
          <div className="l2-cc-browser-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="l2-cc-url-bar">
            <span className="l2-cc-lock-bad">⚠️</span>
            <span className="l2-cc-url-text">htttp://pay-0nline-b0nus.ru/login</span>
          </div>
          <div className="l2-cc-mini-page" />
        </div>
      )}
      {variant === 'urgent' && (
        <div className="l2-cc-urgent-art">
          <div className="l2-cc-alarm">⏰</div>
          <div className="l2-cc-burst">СРОЧНО</div>
          <div className="l2-cc-sparkles">✦ ✦ ✦</div>
        </div>
      )}
      {variant === 'fakeui' && (
        <div className="l2-cc-twin">
          <div className="l2-cc-twin-bad">
            <span className="l2-cc-badge">?</span>
            <div className="l2-cc-twin-logo" />
            <p>Размытый логотип</p>
          </div>
          <div className="l2-cc-twin-good">
            <span className="l2-cc-badge l2-cc-badge-ok">✓</span>
            <div className="l2-cc-twin-logo l2-cc-twin-logo-ok" />
            <p>Чёткий бренд</p>
          </div>
        </div>
      )}
      {variant === 'outro' && (
        <div className="l2-cc-outro-art">
          <div className="l2-cc-checkrow">
            <span>✓</span>
            <span>✓</span>
            <span>✓</span>
          </div>
          <div className="l2-cc-outro-ring" />
        </div>
      )}
    </div>
  )
}

export function Level2PhishingCarousel({ onComplete, onOpenGlossary }) {
  const [i, setI] = useState(0)
  const slide = level2CarouselSlides[i]
  const last = i >= level2CarouselSlides.length - 1

  return (
    <div className="l2-cc-root">
      <div className="l2-cc-topbar">
        <div className="l2-cc-topbar-left">
          <div className="l2-cc-luno-mini">
            <CharacterAvatar name="Луно" />
          </div>
          <div>
            <div className="l2-cc-kicker">ПРИЗНАКИ ФИШИНГА В ИНТЕРНЕТЕ</div>
            <div className="l2-cc-slide-num">
              Слайд {i + 1} / {level2CarouselSlides.length}
            </div>
          </div>
        </div>
        {onOpenGlossary && (
          <button type="button" className="l2-cc-book" onClick={onOpenGlossary} title="Словарик" aria-label="Словарик">
            📖
          </button>
        )}
      </div>

      <div className="l2-cc-card">
        <h2 className="l2-cc-title">{slide.title}</h2>
        <div className="l2-cc-layout">
          <SlideVisual variant={slide.visual} />
          <div className="l2-cc-copy">
            {slide.body &&
              slide.body.map((p, idx) => (
                <p key={idx} className="l2-cc-p">
                  {p}
                </p>
              ))}
            {slide.bullets && (
              <ul className="l2-cc-bullets">
                {slide.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
            <div className="l2-cc-luno">
              <strong>Луно:</strong> {slide.luno}
            </div>
          </div>
        </div>
      </div>

      <div className="l2-cc-footer">
        <div className="l2-cc-dots">
          {level2CarouselSlides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`l2-cc-dot ${idx === i ? 'l2-cc-dot-on' : ''}`}
              onClick={() => setI(idx)}
              aria-label={`Слайд ${idx + 1}`}
            />
          ))}
        </div>
        <div className="l2-cc-nav">
          <button type="button" className="l2-cc-btn l2-cc-btn-ghost" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
            Назад
          </button>
          <button
            type="button"
            className="l2-cc-btn l2-cc-btn-main"
            onClick={() => {
              if (last) onComplete()
              else setI((x) => x + 1)
            }}
          >
            {last ? 'Готово' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  )
}
