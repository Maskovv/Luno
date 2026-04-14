import { useEffect, useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import { virusTheorySlides } from './level3FlowData'
import './level3.css'

const THREAT_NAME = {
  virus: 'Вирус',
  spy: 'Шпионская программа',
  ransom: 'Программа-вымогатель',
  adware: 'Рекламное ПО',
  trojan: 'Троян',
}

function LunoBlock({ block }) {
  if (block.type === 'p')
    return (
      <p className="l3-theory-luno-p">
        <RichText>{block.text}</RichText>
      </p>
    )
  if (block.type === 'ul')
    return (
      <ul className="l3-theory-luno-ul">
        {block.items.map((it) => (
          <li key={it}>
            <RichText>{it}</RichText>
          </li>
        ))}
      </ul>
    )
  return null
}

export function Level3TheoryCarousel({ lunoAvatarUrls, onNext }) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [part, setPart] = useState(0)
  const slide = virusTheorySlides[slideIdx]
  const lastSlide = slideIdx >= virusTheorySlides.length - 1
  const onLuno = part === 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slideIdx, part])

  const advance = () => {
    if (onLuno) {
      setPart(1)
      return
    }
    if (!lastSlide) {
      setSlideIdx((i) => i + 1)
      setPart(0)
      return
    }
    onNext()
  }

  return (
    <div className="l2-card l3-theory-wrap">
      <h2 className="l2-title">Типы вредоносных программ</h2>

      <div className="l3-theory-stage" key={`${slideIdx}-${onLuno ? 'l' : 'c'}`}>
        {onLuno ? (
          <div className="l3-theory-luno-panel">
            <div className="l3-theory-luno-mascot" aria-hidden>
              <LunoPhoto urls={lunoAvatarUrls} className="l3-theory-luno-img" alt="" />
            </div>
            <div className="l3-theory-luno-bubble">
              <p className="l3-theory-luno-label">Луно</p>
              {slide.lunoBlocks.map((b, i) => (
                <LunoBlock key={i} block={b} />
              ))}
            </div>
          </div>
        ) : (
          <div className="l3-slide l3-theory-carousel">
            <div className="l3-slide-copy">
              <div className="l3-slide-emoji-title">
                <span aria-hidden>{slide.emoji}</span>
              </div>
              <p className="l3-card-h">
                <RichText>{`**${THREAT_NAME[slide.key] || 'Тип угрозы'}**`}</RichText>
              </p>
              <p className="l3-card-h">{slide.detectTitle}</p>
              <ul className="l3-card-list">
                {slide.detect.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="l3-card-h">{slide.protectTitle}</p>
              <ul className="l3-card-list">
                {slide.protect.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="l3-slide-visual" aria-hidden>
              <div className="l3-slide-device">
                <div className="l3-slide-chip">Признаки угрозы в интернете</div>
                <div className="l3-slide-hero">{slide.visualIcon}</div>
                <div className="l3-slide-main">{slide.visualTitle}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="l3-slide-actions">
        <button type="button" className="l2-primary" onClick={advance}>
          {lastSlide && !onLuno ? 'Далее →' : 'Далее'}
        </button>
      </div>
    </div>
  )
}
