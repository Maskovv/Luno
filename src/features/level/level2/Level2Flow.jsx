import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { LEVEL2_TITLE, level2Flow, level2Glossary } from './level2FlowData'
import { Game1PhishingEmail } from './Game1PhishingEmail'
import { Level2PhishingCarousel } from './Level2PhishingCarousel'
import { Game2FindSigns } from './Game2FindSigns'
import { ConsequencesGrid } from './ConsequencesGrid'
import { Level2Test } from './Level2Test'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import '../LevelPage.css'
import '../level1/level1.css'
import './level2.css'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'

const LEVEL_ID = '2'

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </>
    )
  }
  return <p>{text}</p>
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

  const finish = () => {
    if (user) {
      unlockNextLevel(user.uid, 3)
      completeLevelInDb(user.uid, LEVEL_ID)
      setLevelStep(user.uid, LEVEL_ID, 0)
    }
    navigate('/levels')
  }

  const item = level2Flow[step]
  if (!item) return <div className="level-page level-page--l2">Загрузка…</div>

  const flowLen = level2Flow.length
  const teacherExitPreview = () => navigate('/levels')

  return (
    <div className="level-page level-page--l2">
      <div className="level-container l2-wide">
        <div className="level-header level-header-with-tools">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{LEVEL2_TITLE}</h1>
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

        {item.type === 'dialogue' && (
          <div className="dialogue-section">
            <div className="character-avatar">
              <div className="avatar-circle l2-avatar-photo">
                <CharacterAvatar name={item.character} />
              </div>
              <div className="character-name">{item.character}</div>
            </div>
            <div className="dialogue-bubble">
              <DialogueLines text={item.text} />
            </div>
            <div className="level-actions">
              <button type="button" className="next-button" onClick={next}>
                Далее →
              </button>
            </div>
          </div>
        )}

        {item.type === 'splash' && (
          <GameSplashScreen
            title={item.title}
            paragraphs={item.paragraphs}
            bullets={item.bullets}
            closing={item.closing}
            buttonText={item.buttonText}
            onContinue={next}
          />
        )}

        {item.type === 'game1' && <Game1PhishingEmail onComplete={next} />}
        {item.type === 'carousel' && (
          <Level2PhishingCarousel onComplete={next} onOpenGlossary={() => setGlossaryOpen(true)} />
        )}
        {item.type === 'game2' && <Game2FindSigns onComplete={next} />}
        {item.type === 'consequences' && <ConsequencesGrid onComplete={next} />}
        {item.type === 'test' && <Level2Test onComplete={finish} />}
      </div>

      {glossaryOpen && (
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
      )}

      {!roleLoading && (
        <TeacherStepSkip
          isTeacher={isTeacher}
          isLastStep={step >= flowLen - 1}
          onSkipStep={next}
          onEndPreview={teacherExitPreview}
          canGoPrev={step > 0}
          onPrevStep={() => save(step - 1)}
        />
      )}
    </div>
  )
}
