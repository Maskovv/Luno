import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { LEVEL2_TITLE, level2Flow } from './level2FlowData'
import { Game1PhishingEmail } from './Game1PhishingEmail'
import { Level2Theory } from './Level2Theory'
import { Game2FindSigns } from './Game2FindSigns'
import { ConsequencesGrid } from './ConsequencesGrid'
import { Level2Test } from './Level2Test'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import '../LevelPage.css'
import './level2.css'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'

const LEVEL_ID = '2'

export function Level2Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelState(user.uid, LEVEL_ID)
      if (cancelled) return
      // если уровень уже пройден — начинаем заново (но незавершённый продолжаем)
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

  return (
    <div className="level-page level-page--l2">
      <div className="level-container l2-wide">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{LEVEL2_TITLE}</h1>
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
              <div className="avatar-circle l2-avatar-photo">
                <CharacterAvatar name={item.character} />
              </div>
              <div className="character-name">{item.character}</div>
            </div>
            <div className="dialogue-bubble">
              <p>{item.text}</p>
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
            buttonText={item.buttonText}
            onContinue={next}
          />
        )}

        {item.type === 'game1' && <Game1PhishingEmail onComplete={next} />}
        {item.type === 'theory' && (
          <Level2Theory title={item.title} bullets={item.bullets} glossary={item.glossary} onNext={next} />
        )}
        {item.type === 'game2' && <Game2FindSigns onComplete={next} />}
        {item.type === 'consequences' && <ConsequencesGrid onComplete={next} />}
        {item.type === 'test' && <Level2Test onComplete={finish} />}
      </div>
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

