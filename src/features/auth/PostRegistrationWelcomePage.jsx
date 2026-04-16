import { useNavigate } from 'react-router-dom'
import { GameSplashScreen } from '../../shared/components/GameSplashScreen'
import { LUNO_AVATAR_URLS } from '../level/level1/level1Scenes'
import '../level/LevelPage.css'

/**
 * Один раз после успешной регистрации — до выбора уровней.
 */
export function PostRegistrationWelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="level-page">
      <div className="level-selection-container" style={{ maxWidth: 720 }}>
        <div className="level-selection-user-row" aria-hidden style={{ minHeight: 8 }} />
        <GameSplashScreen
          title="Добро пожаловать!"
          paragraphs={[
            'Здравствуйте! Это учебная игра по **кибербезопасности** для школьников.',
            'Вы пройдёте сценарии с героями, мини-игры и тесты — шаг за шагом, с подсказками Луно.',
            'Начните с первого уровня: по мере прохождения будут открываться следующие.',
          ]}
          buttonText="Перейти к уровням"
          onContinue={() => navigate('/levels', { replace: true })}
          lunoAvatarUrls={LUNO_AVATAR_URLS}
        />
      </div>
    </div>
  )
}
