import { useState, useEffect } from 'react'
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
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import './level1.css'

const LEVEL_ID = '1'

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </>
    )
  }
  return <p>{text}</p>
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

  return (
    <div className="level-page">
      <div className="level-container l1-wide">
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
        {step > 0 && (
          <div className="scenario-prev-wrap">
            <button type="button" className="scenario-prev-btn" onClick={prev}>
              ← Предыдущий шаг сценария
            </button>
          </div>
        )}

        {item.type === 'dialogue' && (
          <div className="dialogue-section">
            <div className="character-avatar">
              <div className="avatar-circle l1-avatar-photo">
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

        {item.type === 'theory' && (
          <Level1Theory title={item.title} paragraphs={item.paragraphs} onNext={next} />
        )}

        {item.type === 'game1' && <Game1CardSort onComplete={next} />}
        {item.type === 'game2' && <Game2Profile onComplete={next} />}
        {item.type === 'game3' && <Game3BuildProfile onComplete={next} />}
        {item.type === 'game4' && <Game4Password onWin={next} />}
        {item.type === 'game5' && <Game5TwoFactor onComplete={next} />}
        {item.type === 'test' && <Level1FinalTest onComplete={completeLevel} />}
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
      )}

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
