import { useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { carouselSlides } from './level2FlowData'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import { Level2CarouselSlideArt } from './Level2CarouselSlideArt'
import './level2.css'

export function Level2Carousel({ onNext }) {
  const total = carouselSlides.length
  const [i, setI] = useState(0)
  const slide = carouselSlides[i]
  const last = i >= total - 1

  const fg = slide.fg

  return (
    <div
      className="l2-carousel"
      style={{ background: slide.bg, color: fg || '#111' }}
    >
      <header className="l2-carousel-top">
        <div className="l2-carousel-avatars l2-carousel-avatars--luno-only">
          <div className="l2-carousel-av l2-carousel-av--photo">
            <LunoPhoto urls={LUNO_AVATAR_URLS} className="l2-carousel-luno-img" alt="" />
          </div>
        </div>
        <div className="l2-carousel-bubble" style={fg ? { color: '#111' } : undefined}>
          {slide.bubble}
        </div>
      </header>

      <div className="l2-carousel-main">
        <div className="l2-carousel-left">
          <p className="l2-carousel-kicker">{slide.kicker}</p>
          <h2 className="l2-carousel-title">{slide.title}</h2>
          <button
            type="button"
            className="l2-carousel-next"
            onClick={() => (last ? onNext() : setI((x) => x + 1))}
          >
            {last ? 'Далее →' : 'Далее'}
          </button>
          <p className="l2-carousel-progress">
            <span>{i + 1}</span>
            <span className="l2-carousel-progress-line" />
            <span>{total}</span>
          </p>
        </div>
        <div className="l2-carousel-right">
          <div className="l2-carousel-stack">
            <div className="l2-carousel-card l2-carousel-card--art">
              <Level2CarouselSlideArt index={i + 1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
