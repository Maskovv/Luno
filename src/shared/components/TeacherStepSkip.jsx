import './TeacherStepSkip.css'

/**
 * Только для учителя: переход к следующему шагу сценария без выполнения задания.
 * На последнем шаге — выход к списку уровней без засчитывания прохождения (обрабатывает родитель).
 */
export function TeacherStepSkip({ isTeacher, isLastStep, onSkipStep, onEndPreview }) {
  if (!isTeacher) return null

  const handleClick = () => {
    if (isLastStep) onEndPreview()
    else onSkipStep()
  }

  return (
    <div className="teacher-step-skip" role="region" aria-label="Режим просмотра для учителя">
      <button type="button" className="teacher-step-skip-btn" onClick={handleClick}>
        {isLastStep ? 'Завершить просмотр' : 'Следующий шаг без ответа'}
      </button>
    </div>
  )
}
