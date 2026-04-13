import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

export function TeacherRoute({ children }) {
  const { user, loading, roleLoading, isTeacher } = useAuth()

  if (loading || roleLoading) return <div>Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isTeacher) return <Navigate to="/levels" replace />
  return children
}

