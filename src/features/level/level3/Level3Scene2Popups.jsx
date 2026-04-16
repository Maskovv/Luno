import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RichText } from '../../../shared/components/RichText'
import { LEVEL3_TITLE } from './level3FlowData'
import { level3UrlsForScene } from './level3Scenes'
import './level3.css'

function Backdrop({ attempt, setAttempt }) {
  const urls = level3UrlsForScene('scene2')
  const src = urls[attempt]
  if (!src || attempt >= urls.length) {
    return <div className="l1-backdrop l1-backdrop--empty" aria-hidden />
  }
  return (
    <div className="l1-backdrop" aria-hidden>
      <div className="l1-backdrop-picture">
        <img
          key={src}
          src={src}
          alt=""
          className="l1-backdrop-img"
          loading="eager"
          decoding="async"
          onError={() => setAttempt((a) => a + 1)}
        />
      </div>
    </div>
  )
}

export function Level3Scene2Popups({ onNext, flowStep = 0, onBackToLevels }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState(0)
  const [pop, setPop] = useState({ a: false, b: false })

  useEffect(() => {
    setAttempt(0)
  }, [flowStep])

  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPop({ a: true, b: true }), 450)
      return () => clearTimeout(t)
    }
    setPop({ a: false, b: false })
  }, [phase])

  const line1 =
    '— А ты уверен, что с этого сайта можно **скачивать**? Сайт выглядит **подозрительно**… помнишь, что **Луно** говорил…'
  const line2 = '— Вань… у тебя что-то странное происходит…'

  const popupsDone = phase === 1 && !pop.a && !pop.b

  return (
    <div className="level-page level-page--l3 level-page--l1-cinematic level-page--l3-pop">
      <div className="l1-cinematic-root">
        <Backdrop attempt={attempt} setAttempt={setAttempt} />
        <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
          <div className="level-header">
            <button
              type="button"
              className="back-button"
              onClick={() => (onBackToLevels ? onBackToLevels() : navigate('/levels'))}
            >
              ← Назад
            </button>
            <h1>{LEVEL3_TITLE}</h1>
          </div>
        </div>

        {phase === 1 && pop.a && (
          <div className="l3-auto-popups" role="dialog" aria-modal="true" aria-label="Всплывающее окно рекламы">
            <div className="l3-fake-popup l3-fake-popup--a">
              <div className="l3-fake-popup-title">Реклама</div>
              <p className="l3-fake-popup-p">Вы выиграли приз! Заберите прямо сейчас!</p>
              <button type="button" className="l3-fake-popup-x" onClick={() => setPop((p) => ({ ...p, a: false }))}>
                ✕ Закрыть
              </button>
            </div>
          </div>
        )}
        {phase === 1 && pop.b && (
          <div className="l3-auto-popups l3-auto-popups--b" role="dialog" aria-modal="true" aria-label="Всплывающее окно">
            <div className="l3-fake-popup l3-fake-popup--b">
              <div className="l3-fake-popup-title">Срочно!</div>
              <p className="l3-fake-popup-p">Подтвердите данные, иначе аккаунт заблокируют.</p>
              <button type="button" className="l3-fake-popup-x" onClick={() => setPop((p) => ({ ...p, b: false }))}>
                ✕ Закрыть
              </button>
            </div>
          </div>
        )}

        <div className="l1-cinematic-body l1-cinematic-body--dialogue" onClick={(e) => e.stopPropagation()}>
          <div className="dialogue-section l1-dialogue-cinematic">
            <div className="dialogue-bubble l1-dialogue-bubble-glass">
              <p className="l1-dialogue-speaker">Дима</p>
              {phase === 0 ? (
                <p>
                  <RichText>{line1}</RichText>
                </p>
              ) : (
                <>
                  <p>
                    <RichText>{line1}</RichText>
                  </p>
                  <p>
                    <RichText>{line2}</RichText>
                  </p>
                </>
              )}
            </div>
            <div className="level-actions l1-cinematic-actions">
              {phase === 0 ? (
                <button type="button" className="next-button" onClick={() => setPhase(1)}>
                  Далее →
                </button>
              ) : (
                <>
                  <button type="button" className="next-button" disabled={!popupsDone} onClick={onNext}>
                    Далее →
                  </button>
                  {!popupsDone && (
                    <p className="l1-tap-hint">Закрой оба всплывающих окна</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
