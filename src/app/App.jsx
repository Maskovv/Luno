import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../features/auth'
import { QRCodePage } from '../features/qr-code'
import { LoginPage } from '../features/auth'
import { LevelSelectionPage } from '../features/level-selection'
import { LevelPage } from '../features/level'
import { StatisticsPage } from '../features/statistics'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'
import { TeacherRoute } from '../shared/components/TeacherRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/qr"
            element={
              <TeacherRoute>
                <QRCodePage />
              </TeacherRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/levels"
            element={
              <ProtectedRoute>
                <LevelSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/:levelId"
            element={
              <ProtectedRoute>
                <LevelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <TeacherRoute>
                <StatisticsPage />
              </TeacherRoute>
            }
          />
          <Route path="/" element={<Navigate to="/qr" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

