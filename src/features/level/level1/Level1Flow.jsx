import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { level1Flow, LEVEL1_TITLE, level1Glossary } from './level1FlowData'
import { Level1Theory } from './Level1Theory'
import { Game1CardSort } from './Game1CardSort'
import { Game2Profile } from './Game2Profile'
import { Game3BuildProfile } from './Game3BuildProfile'
import { Game4Password } from './Game4Password'
import { Game5TwoFactor } from './Game5TwoFactor'
import { Level1FinalTest } from './Level1FinalTest'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { RichText } from '../../../shared/components/RichText'
import { level1UrlsForBg, LUNO_AVATAR_URLS } from './level1Scenes'
import './level1.css'

const LEVEL_ID = '1'

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, i) => (
          <p key={i}>
            <RichText>{line}</RichText>
          </p>
        ))}
      </>
    )
  }
  return (
    <p>
      <RichText>{text}</RichText>
    </p>
  )
}

function Level1Backdrop({ bgKey }) {
  const urls = useMemo(() => (bgKey ? level1UrlsForBg(bgKey) : []), [bgKey])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [bgKey])

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
          onError={() => setAttempt((a) => a + 1)}
        />
      </div>
    </div>
  )
}

export function Level1Flow() {
  const navigate = useNavigate()
  const { user, isTeacher, roleLoading } = useAuth()
  const [step, setStep] = useState(0)
  const [glossaryOpen, setGlossaryOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelState(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < level1Flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const saveStep = (next) => {
    setStep(next)
    if (user) setLevelStep(user.uid, LEVEL_ID, next)
  }

  const next = () => saveStep(step + 1)
  const prev = () => saveStep(Math.max(0, step - 1))

  const completeLevel = () => {
    if (user) {
      unlockNextLevel(user.uid, 2)
      completeLevelInDb(user.uid, LEVEL_ID)
      setLevelStep(user.uid, LEVEL_ID, 0)
    }
    navigate('/levels')
  }

  const item = level1Flow[step]
  if (!item) {
    return <div className="level-page">Загрузка…</div>
  }

  const flowLen = level1Flow.length
  const teacherExitPreview = () => navigate('/levels')

  const isCinematic = item.type === 'scene' || (item.type === 'dialogue' && item.bgKey)

  const renderHeader = () => (
    <div className="level-header level-header-with-tools">
      <button type="button" className="back-button" onClick={() => navigate('/levels')}>
        ← Назад
      </button>
      <h1>{LEVEL1_TITLE}</h1>
      <button
        type="button"
        className="l1-glossary-toggle"
        onClick={() => setGlossaryOpen(true)}
        aria-label="Открыть словарик"
        title="Словарик"
      >
        📖
      </button>
    </div>
  )

  const renderPrev = () =>
    step > 0 && (
      <div className="scenario-prev-wrap">
        <button type="button" className="scenario-prev-btn" onClick={prev}>
          ← Предыдущий шаг сценария
        </button>
      </div>
    )

  const glossaryModal = glossaryOpen && (
    <div
      className="l1-glossary-modal-backdrop"
      role="presentation"
      onClick={() => setGlossaryOpen(false)}
    >
      <div
        className="l1-glossary-modal"
        role="dialog"
        aria-labelledby="l1-glossary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="l1-glossary-modal-head">
          <span className="l1-glossary-modal-icon" aria-hidden>
            📖
          </span>
          <h2 id="l1-glossary-title">Словарик</h2>
        </div>
        <div className="l1-glossary-modal-body">
          {level1Glossary.map((entry) => (
            <div key={entry.term} className="l1-glossary-modal-item">
              <strong>{entry.term}</strong>
              <p>{entry.def}</p>
            </div>
          ))}
        </div>
        <button type="button" className="l1-glossary-close" onClick={() => setGlossaryOpen(false)}>
          Закрыть
        </button>
      </div>
    </div>
  )

  const teacherSkip = !roleLoading && (
    <TeacherStepSkip
      isTeacher={isTeacher}
      isLastStep={step >= flowLen - 1}
      onSkipStep={next}
      onEndPreview={teacherExitPreview}
    />
  )

  return (
    <div className={`level-page ${isCinematic ? 'level-page--l1-cinematic' : ''}`}>
      {isCinematic ? (
        <div className="l1-cinematic-root">
          <Level1Backdrop bgKey={item.bgKey} />
          <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
            {renderHeader()}
            {renderPrev()}
          </div>
          <div
            className={`l1-cinematic-body ${item.type === 'dialogue' ? 'l1-cinematic-body--dialogue' : ''}`}
            onClick={next}
            role="presentation"
          >
            {item.type === 'scene' && (
              <div className="l1-scene-cta">
                <p className="l1-scene-hint">Щёлкни по экрану или нажми кнопку, чтобы продолжить</p>
                <div className="level-actions l1-scene-actions">
                  <button
                    type="button"
                    className="next-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      next()
                    }}
                  >
                    Продолжить →
                  </button>
                </div>
              </div>
            )}
            {item.type === 'dialogue' && (
              <div className="dialogue-section l1-dialogue-cinematic">
                <div className="dialogue-bubble l1-dialogue-bubble-glass">
                  <p className="l1-dialogue-speaker">{item.character}</p>
                  <DialogueLines text={item.text} />
                </div>
                <div className="level-actions l1-cinematic-actions">
                  <button
                    type="button"
                    className="next-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      next()
                    }}
                  >
                    Далее →
                  </button>
                  <p className="l1-tap-hint">или щёлкни по экрану</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="level-container l1-wide">
          {renderHeader()}
          {renderPrev()}

          {item.type === 'splash' && (
            <GameSplashScreen
              title={item.title}
              paragraphs={item.paragraphs}
              bullets={item.bullets}
              closing={item.closing}
              buttonText={item.buttonText}
              onContinue={next}
              lunoAvatarUrls={LUNO_AVATAR_URLS}
            />
          )}

          {item.type === 'theory' && (
            <Level1Theory title={item.title} paragraphs={item.paragraphs} onNext={next} />
          )}

          {item.type === 'game1' && <Game1CardSort onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
          {item.type === 'game2' && <Game2Profile onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
          {item.type === 'game3' && <Game3BuildProfile onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
          {item.type === 'game4' && <Game4Password onWin={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
          {item.type === 'game5' && <Game5TwoFactor onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
          {item.type === 'test' && <Level1FinalTest onComplete={completeLevel} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
        </div>
      )}

      {glossaryModal}
      {teacherSkip}
    </div>
  )
}
