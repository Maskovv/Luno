import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { getUnlockedLevels } from '../../shared/api/firestoreProgress'
import { UserAccountBar } from '../../shared/components/UserAccountBar'
import './LevelSelectionPage.css'

export function LevelSelectionPage() {
  const { user, isTeacher } = useAuth()
  const navigate = useNavigate()
  const [unlockedLevels, setUnlockedLevels] = useState([1])

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const levels = await getUnlockedLevels(user.uid)
      if (!cancelled) setUnlockedLevels(levels)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleLevelClick = (levelId) => {
    if (unlockedLevels.includes(levelId)) {
      navigate(`/level/${levelId}`)
    }
  }

  // TODO: Заменить на реальные данные уровней
  const levels = [
    { id: 1, title: 'Уровень 1', description: 'Цифровая идентичность, профиль, пароли, 2FA' },
    { id: 2, title: 'Уровень 2', description: 'Фишинг: признаки, последствия, тест' },
    { id: 3, title: 'Уровень 3', description: 'Вирусы и вредоносные программы' },
    { id: 4, title: 'Уровень 4', description: 'Финансовые мошенничества в киберсреде' },
    { id: 5, title: 'Уровень 5', description: 'Кибербуллинг' },
  ]

  return (
    <div className="level-selection-page">
      <div className="level-selection-container">
        <div className="level-selection-user-row">
          <UserAccountBar tone="light" />
        </div>
        <h1>Выберите уровень</h1>
        {isTeacher && (
          <div className="teacher-panel">
            <h2>Панель учителя</h2>
            <div className="teacher-panel-actions">
              <button
                type="button"
                className="teacher-button"
                onClick={() => navigate('/qr')}
              >
                QR для подключения
              </button>
              <button
                type="button"
                className="teacher-button"
                onClick={() => navigate('/statistics')}
              >
                Статистика
              </button>
            </div>
          </div>
        )}
        <div className="levels-grid">
          {levels.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id)
            return (
              <div
                key={level.id}
                className={`level-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => handleLevelClick(level.id)}
              >
                <div className="level-number">{level.id}</div>
                <h3>{level.title}</h3>
                <p>{level.description}</p>
                {!isUnlocked && (
                  <div className="lock-overlay">
                    <span>🔒</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

