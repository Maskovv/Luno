import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { RichText } from '../../../shared/components/RichText'
import { LEVEL2_TITLE, level2Flow, level2Glossary } from './level2FlowData'
import { Game1PhishingEmail } from './Game1PhishingEmail'
import { Game2FindSigns } from './Game2FindSigns'
import { ConsequencesGrid } from './ConsequencesGrid'
import { Level2Test } from './Level2Test'
import { Level2Carousel } from './Level2Carousel'
import { level2UrlsForScene } from './level2Scenes'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import '../LevelPage.css'
import '../level1/level1.css'
import './level2.css'

const LEVEL_ID = '2'

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

function Level2Backdrop({ bgKey }) {
  const urls = useMemo(() => (bgKey ? level2UrlsForScene(bgKey) : []), [bgKey])
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

export function Level2Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
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
      if (state?.step != null && state.step < level2Flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const save = (next) => {
    setStep(next)
    if (user) setLevelStep(user.uid, LEVEL_ID, next)
  }
  const next = () => save(step + 1)
  const prev = () => save(Math.max(0, step - 1))

  const finish = async () => {
    if (user) {
      await Promise.all([
        unlockNextLevel(user.uid, 3),
        completeLevelInDb(user.uid, LEVEL_ID),
        setLevelStep(user.uid, LEVEL_ID, 0),
      ])
    }
    navigate('/levels')
  }

  const item = level2Flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = level2Flow.length
  const teacherExitPreview = () => navigate('/levels')

  const isCinematic = item.type === 'dialogue' && item.bgKey

  const glossaryModal = glossaryOpen && (
    <div
      className="l1-glossary-modal-backdrop"
      role="presentation"
      onClick={() => setGlossaryOpen(false)}
    >
      <div
        className="l1-glossary-modal"
        role="dialog"
        aria-labelledby="l2-glossary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="l1-glossary-modal-head">
          <span className="l1-glossary-modal-icon" aria-hidden>
            📖
          </span>
          <h2 id="l2-glossary-title">Словарик</h2>
        </div>
        <div className="l1-glossary-modal-body">
          {level2Glossary.map((entry) => (
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

  const headerWithGlossary = () => (
    <div className="level-header level-header-with-tools">
      <button type="button" className="back-button" onClick={() => navigate('/levels')}>
        ← Назад
      </button>
      <h1>{LEVEL2_TITLE}</h1>
      <button
        type="button"
        className="l1-glossary-toggle l2-glossary-toggle"
        onClick={() => setGlossaryOpen(true)}
        aria-label="Открыть словарик"
        title="Словарик"
      >
        📖
        <span className="l2-glossary-badge">{level2Glossary.length}</span>
      </button>
    </div>
  )

  const prevBtn = step > 0 && (
    <div className="scenario-prev-wrap">
      <button type="button" className="scenario-prev-btn" onClick={prev}>
        ← Предыдущий шаг сценария
      </button>
    </div>
  )

  if (isCinematic) {
    return (
      <div className="level-page level-page--l2 level-page--l1-cinematic">
        <div className="l1-cinematic-root">
          <Level2Backdrop bgKey={item.bgKey} />
          <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
            {headerWithGlossary()}
            {prevBtn}
          </div>
          <div
            className="l1-cinematic-body l1-cinematic-body--dialogue"
            onClick={next}
            role="presentation"
          >
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
          </div>
        </div>
        {glossaryModal}
        {!roleLoading && (
          <TeacherStepSkip
            isTeacher={isTeacher}
            isLastStep={step >= flowLen - 1}
            onSkipStep={next}
            onEndPreview={teacherExitPreview}
          />
        )}
      </div>
    )
  }

  return (
    <div className="level-page level-page--l2">
      <div className="level-container l2-wide">
        {headerWithGlossary()}
        {prevBtn}

        {item.type === 'splash' && (
          <GameSplashScreen
            title={item.title}
            paragraphs={item.paragraphs}
            buttonText={item.buttonText}
            onContinue={next}
            lunoAvatarUrls={LUNO_AVATAR_URLS}
          />
        )}

        {item.type === 'game1' && <Game1PhishingEmail onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
        {item.type === 'carousel' && <Level2Carousel onNext={next} />}
        {item.type === 'game2' && <Game2FindSigns onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
        {item.type === 'consequences' && <ConsequencesGrid onComplete={next} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
        {item.type === 'test' && <Level2Test onComplete={finish} lunoAvatarUrls={LUNO_AVATAR_URLS} />}
      </div>
      {glossaryModal}
      {!roleLoading && (
        <TeacherStepSkip
          isTeacher={isTeacher}
          isLastStep={step >= flowLen - 1}
          onSkipStep={next}
          onEndPreview={teacherExitPreview}
        />
      )}
    </div>
  )
}
