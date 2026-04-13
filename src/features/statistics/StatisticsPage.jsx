import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsersForTeacherStats } from '../../shared/api/firestoreProgress'
import { useAuth } from '../auth'
import { UserAccountBar } from '../../shared/components/UserAccountBar'
import './StatisticsPage.css'

export function StatisticsPage() {
  const navigate = useNavigate()
  const { isTeacher, user } = useAuth()
  const [statistics, setStatistics] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!isTeacher || !user) return
    ;(async () => {
      const users = await getUsersForTeacherStats(user.uid)
      const students = users
        .filter((u) => u.role !== 'teacher')
        .map((u) => {
          const unlocked = Array.isArray(u.unlockedLevels) ? u.unlockedLevels : [1]
          const completedLevels = u.completedLevels || {}
          const completedCount = Object.values(completedLevels).filter(Boolean).length
          return {
            uid: u.uid,
            name: u.displayName || u.email || u.uid,
            email: u.email || '',
            unlocked,
            completedLevels,
            completedCount,
          }
        })
        .sort((a, b) => b.completedCount - a.completedCount)

      const stats = {
        totalUsers: students.length,
        completedLevels: {},
        averageProgress: 0,
        students,
      }

      for (const u of students) {
        const unlocked = u.unlocked
        for (const level of unlocked) {
          stats.completedLevels[level] = (stats.completedLevels[level] || 0) + 1
        }
      }

      if (stats.totalUsers > 0) {
        const totalUnlocked = Object.values(stats.completedLevels).reduce((sum, count) => sum + count, 0)
        stats.averageProgress = (totalUnlocked / stats.totalUsers).toFixed(2)
      }

      if (!cancelled) setStatistics(stats)
    })()
    return () => {
      cancelled = true
    }
  }, [isTeacher, user])

  if (!statistics) {
    return <div className="statistics-page">Загрузка статистики...</div>
  }

  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <div className="statistics-header">
          <button className="back-button" onClick={() => navigate('/levels')}>
            ← Назад
          </button>
          <h1>Статистика</h1>
          <UserAccountBar tone="dark" />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{statistics.totalUsers}</div>
            <div className="stat-label">Всего учеников</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{statistics.averageProgress}</div>
            <div className="stat-label">Средний прогресс</div>
          </div>
        </div>

        <div className="levels-stats">
          <h2>Прохождение по уровням</h2>
          <div className="levels-list">
            {Object.entries(statistics.completedLevels).map(([level, count]) => (
              <div key={level} className="level-stat-item">
                <span className="level-name">Уровень {level}</span>
                <span className="level-count">{count} учеников</span>
              </div>
            ))}
            {Object.keys(statistics.completedLevels).length === 0 && (
              <p className="no-data">Нет данных о прохождении уровней</p>
            )}
          </div>
        </div>

        <div className="levels-stats">
          <h2>Ученики</h2>
          <div className="levels-list">
            {statistics.students.map((s) => (
              <div key={s.uid} className="level-stat-item">
                <span className="level-name">
                  {s.name}
                  {s.email ? <span className="student-email"> ({s.email})</span> : null}
                </span>
                <span className="level-count">
                  Открыто уровней: {s.unlocked.length} · Пройдено: {s.completedCount}
                </span>
              </div>
            ))}
            {statistics.students.length === 0 && <p className="no-data">Пока нет учеников</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

