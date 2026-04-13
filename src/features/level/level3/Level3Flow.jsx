import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { LEVEL3_TITLE, level3FlowSteps, level3Glossary } from './level3Data'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { Level3MalwareCarousel } from './Level3MalwareCarousel'
import { UniversalRules } from './UniversalRules'
import { Level3Maze } from './Level3Maze'
import { SafePcGame } from './SafePcGame'
import { Level3Test } from './Level3Test'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import '../LevelPage.css'
import '../level1/level1.css'
import '../level2/level2.css'
import './level3.css'

const LEVEL_ID = '3'

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

export function Level3Flow() {
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
      if (state?.step != null && state.step < level3FlowSteps.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const save = (n) => {
    setStep(n)
    if (user) setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => save(step + 1)

  const finish = () => {
    if (user) {
      unlockNextLevel(user.uid, 4)
      completeLevelInDb(user.uid, LEVEL_ID)
      setLevelStep(user.uid, LEVEL_ID, 0)
    }
    navigate('/levels')
  }

  const item = level3FlowSteps[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = level3FlowSteps.length
  const teacherExitPreview = () => navigate('/levels')

  return (
    <div className="level-page level-page--l3">
      <div className="level-container l2-wide">
        <div className="level-header level-header-with-tools">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{LEVEL3_TITLE}</h1>
          <button
            type="button"
            className="l1-glossary-toggle"
            onClick={() => setGlossaryOpen(true)}
            aria-label="Словарик"
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

        {item.type === 'theory' && (
          <Level3MalwareCarousel onComplete={next} onOpenGlossary={() => setGlossaryOpen(true)} />
        )}
        {item.type === 'maze' && <Level3Maze onNext={next} />}
        {item.type === 'rules' && <UniversalRules onNext={next} />}
        {item.type === 'safepc' && <SafePcGame onComplete={next} />}
        {item.type === 'test' && <Level3Test onComplete={finish} />}
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
            aria-labelledby="l3-glossary-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="l1-glossary-modal-head">
              <span className="l1-glossary-modal-icon" aria-hidden>
                📖
              </span>
              <h2 id="l3-glossary-title">Словарик</h2>
            </div>
            <div className="l1-glossary-modal-body">
              {level3Glossary.map((entry) => (
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
