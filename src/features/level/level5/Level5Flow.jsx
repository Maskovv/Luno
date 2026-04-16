import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  flushLevelStepForExit,
  getLevelProgress,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { RichText } from '../../../shared/components/RichText'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { LEVEL5_TITLE, level5Flow } from './level5FlowData'
import { Level5Game1 } from './Level5Game1'
import { Level5Game2 } from './Level5Game2'
import { Level5Game3 } from './Level5Game3'
import { Level5FinalVictory, Level5Test } from './Level5Test'
import { level1UrlsForBg, LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import { level5UrlsForScene } from './level5Scenes'
import '../LevelPage.css'
import '../level1/level1.css'
import '../level2/level2.css'
import './level5.css'

const LEVEL_ID = '5'

function Level5Backdrop({ item }) {
  const urls = useMemo(() => {
    if (item.bgKind === 'l1') return level1UrlsForBg(item.bgKey)
    return level5UrlsForScene(item.bgKey)
  }, [item])

  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [item])

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

export function Level5Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelProgress(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < level5Flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const save = async (n) => {
    setStep(n)
    if (user) await setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => void save(step + 1)
  const prev = () => void save(Math.max(0, step - 1))

  const exitToLevels = async () => {
    await flushLevelStepForExit(user?.uid, LEVEL_ID, step)
    navigate('/levels')
  }

  const finish = async () => {
    if (user) {
      await Promise.all([
        unlockNextLevel(user.uid, 6),
        completeLevelInDb(user.uid, LEVEL_ID),
        setLevelStep(user.uid, LEVEL_ID, 0),
      ])
    }
    navigate('/levels')
  }

  const item = level5Flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = level5Flow.length
  const teacherExitPreview = () => void exitToLevels()

  const prevBtn = step > 0 && (
    <div className="scenario-prev-wrap">
      <button type="button" className="scenario-prev-btn" onClick={prev}>
        ← Предыдущий шаг сценария
      </button>
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

  const isCinematicDialogue = item.type === 'dialogue'

  if (isCinematicDialogue) {
    return (
      <div className="level-page level-page--l5 level-page--l1-cinematic">
        <div className="l1-cinematic-root">
          <Level5Backdrop key={step} item={item} />
          <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
            <div className="level-header">
              <button type="button" className="back-button" onClick={() => void exitToLevels()}>
                ← Назад
              </button>
              <h1>{LEVEL5_TITLE}</h1>
            </div>
            {prevBtn}
          </div>
          <div
            className="l1-cinematic-body l1-cinematic-body--dialogue"
            onClick={next}
            role="presentation"
          >
            <div className="dialogue-section l1-dialogue-cinematic">
              <div className="dialogue-bubble l1-dialogue-bubble-glass">
                {!item.hideSpeaker && item.character && (
                  <p className="l1-dialogue-speaker">{item.character}</p>
                )}
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
        {teacherSkip}
      </div>
    )
  }

  return (
    <div className="level-page level-page--l5">
      <div className="level-container l2-wide l5-level">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => void exitToLevels()}>
            ← Назад
          </button>
          <h1>{LEVEL5_TITLE}</h1>
        </div>
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

        {item.type === 'game1' && <Level5Game1 onNext={next} />}
        {item.type === 'game2' && <Level5Game2 onNext={next} />}
        {item.type === 'game3' && <Level5Game3 onNext={next} />}
        {item.type === 'test' && <Level5Test onComplete={next} />}
        {item.type === 'finalVictory' && <Level5FinalVictory onFinish={finish} />}
      </div>
      {teacherSkip}
    </div>
  )
}
