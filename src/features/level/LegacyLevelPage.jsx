import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { storage } from '../../shared/utils/storage'
import './LevelPage.css'

/** Заглушка для уровней 2+ (пока без сценария из документа) */
export function LegacyLevelPage() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [levelData, setLevelData] = useState(null)

  useEffect(() => {
    const mockLevelData = {
      id: parseInt(levelId, 10),
      title: `Уровень ${levelId}`,
      dialogues: [
        {
          character: 'Гид',
          text: 'Этот уровень пока в разработке. Скоро здесь будет сценарий.',
        },
      ],
      theory: 'Следите за обновлениями.',
    }
    setLevelData(mockLevelData)
    if (user) {
      const progress = storage.get(`level_${levelId}_${user.uid}`)
      if (progress?.dialogueIndex !== undefined) {
        setCurrentDialogueIndex(progress.dialogueIndex)
      }
    }
  }, [levelId, user])

  const handleNext = () => {
    if (!levelData) return
    if (currentDialogueIndex < levelData.dialogues.length - 1) {
      const newIndex = currentDialogueIndex + 1
      setCurrentDialogueIndex(newIndex)
      if (user) {
        storage.set(`level_${levelId}_${user.uid}`, { dialogueIndex: newIndex })
      }
    } else {
      if (user) {
        const progress = storage.get(`progress_${user.uid}`) || { unlockedLevels: [1] }
        const nextLevel = parseInt(levelId, 10) + 1
        if (!progress.unlockedLevels.includes(nextLevel)) {
          progress.unlockedLevels.push(nextLevel)
          storage.set(`progress_${user.uid}`, progress)
        }
        storage.set(`level_${levelId}_${user.uid}`, {
          completed: true,
          completedAt: new Date().toISOString(),
        })
      }
      alert('Уровень пройден!')
      navigate('/levels')
    }
  }

  if (!levelData) {
    return <div className="level-page">Загрузка...</div>
  }

  const currentDialogue = levelData.dialogues[currentDialogueIndex]
  const isLastDialogue = currentDialogueIndex === levelData.dialogues.length - 1

  return (
    <div className="level-page">
      <div className="level-container">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>{levelData.title}</h1>
        </div>
        <div className="dialogue-section">
          <div className="character-avatar">
            <div className="avatar-circle">{currentDialogue.character[0]}</div>
            <div className="character-name">{currentDialogue.character}</div>
          </div>
          <div className="dialogue-bubble">
            <p>{currentDialogue.text}</p>
          </div>
        </div>
        <div className="level-actions">
          <button type="button" className="next-button" onClick={handleNext}>
            {isLastDialogue ? 'Завершить' : 'Далее →'}
          </button>
        </div>
        {isLastDialogue && (
          <div className="theory-section">
            <h2>Теория</h2>
            <div className="theory-content">
              <p>{levelData.theory}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
