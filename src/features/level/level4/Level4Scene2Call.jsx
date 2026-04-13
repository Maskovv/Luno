import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RichText } from '../../../shared/components/RichText'
import { LEVEL4_TITLE } from './level4FlowData'
import { level4UrlsForScene } from './level4Scenes'
import '../level1/level1.css'
import './level4.css'

function BackdropScene2({ flowStep }) {
  const urls = useMemo(() => level4UrlsForScene('scene2'), [])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [flowStep])

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

const DIALOGUES = [
  {
    speaker: 'Мошенник',
    lines: [
      '— Здравствуйте. Это **служба безопасности банка**.',
      'На ваше имя сейчас пытаются оформить **кредит**.',
    ],
  },
  {
    speaker: 'Ваня',
    lines: '— Что?.. Я ничего не оформлял!',
  },
  {
    speaker: 'Мошенник',
    lines: [
      '— Тогда нужно срочно **остановить операцию**.',
      'Сейчас вам придёт **СМС-код**.',
      'Назовите его, чтобы **отменить кредит**.',
    ],
  },
  {
    speaker: 'Маша',
    lines: [
      '— Ваня, быстрее скажи **код**!',
      'Если это правда, вдруг на тебя оформят **кредит**!',
    ],
  },
]

function DialogueBlock({ speaker, lines }) {
  const arr = Array.isArray(lines) ? lines : [lines]
  return (
    <>
      <p className="l1-dialogue-speaker">{speaker}</p>
      {arr.map((line, i) => (
        <p key={i}>
          <RichText>{line}</RichText>
        </p>
      ))}
    </>
  )
}

/**
 * Сцена 2: звонок + всплывающее «СМС» + реплика Маши.
 */
export function Level4Scene2Call({ onNext, onScenarioPrev, flowStep = 0 }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [smsOpen, setSmsOpen] = useState(false)

  useEffect(() => {
    setStep(0)
    setSmsOpen(false)
  }, [flowStep])

  const advance = () => {
    if (step === 2) {
      setSmsOpen(true)
      return
    }
    if (step === 3) {
      onNext()
      return
    }
    setStep((s) => s + 1)
  }

  const closeSms = () => {
    setSmsOpen(false)
    setStep(3)
  }

  return (
    <div className="level-page level-page--l4 level-page--l1-cinematic">
      <div className="l1-cinematic-root">
        <BackdropScene2 flowStep={flowStep} />
        <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
          <div className="level-header">
            <button type="button" className="back-button" onClick={() => navigate('/levels')}>
              ← Назад
            </button>
            <h1>{LEVEL4_TITLE}</h1>
          </div>
          {flowStep > 0 && onScenarioPrev && (
            <div className="scenario-prev-wrap">
              <button type="button" className="scenario-prev-btn" onClick={onScenarioPrev}>
                ← Предыдущий шаг сценария
              </button>
            </div>
          )}
        </div>

        {smsOpen && (
          <div className="l4-sms-overlay" role="dialog" aria-modal="true" aria-label="Сообщение СМС">
            <div className="l4-sms-card">
              <div className="l4-sms-title">Новое сообщение</div>
              <p className="l4-sms-body">
                <RichText>
                  Код подтверждения: **482913**. Никому не сообщайте этот код.
                </RichText>
              </p>
              <button type="button" className="l2-primary l4-sms-close" onClick={closeSms}>
                Закрыть
              </button>
            </div>
          </div>
        )}

        <div
          className="l1-cinematic-body l1-cinematic-body--dialogue"
          onClick={smsOpen ? undefined : advance}
          role="presentation"
        >
          <div className="dialogue-section l1-dialogue-cinematic">
            <div className="dialogue-bubble l1-dialogue-bubble-glass">
              <DialogueBlock speaker={DIALOGUES[step].speaker} lines={DIALOGUES[step].lines} />
            </div>
            <div className="level-actions l1-cinematic-actions">
              <button
                type="button"
                className="next-button"
                onClick={(e) => {
                  e.stopPropagation()
                  advance()
                }}
              >
                Далее →
              </button>
              {!smsOpen && <p className="l1-tap-hint">или щёлкни по экрану</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
