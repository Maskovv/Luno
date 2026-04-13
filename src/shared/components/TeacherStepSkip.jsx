import './TeacherStepSkip.css'

/**
 * Только для учителя: просмотр сценария — шаг назад/вперёд без выполнения заданий.
 * На последнем шаге основная кнопка — выход к списку уровней (без засчитывания прохождения).
 */
export function TeacherStepSkip({
  isTeacher,
  isLastStep,
  onSkipStep,
  onEndPreview,
  canGoPrev,
  onPrevStep,
}) {
  if (!isTeacher) return null

  const handleForward = () => {
    if (isLastStep) onEndPreview()
    else onSkipStep()
  }

  return (
    <div className="teacher-step-skip" role="region" aria-label="Режим просмотра для учителя">
      <div className="teacher-step-skip-stack">
        {canGoPrev && onPrevStep && (
          <button type="button" className="teacher-step-skip-btn teacher-step-skip-btn--secondary" onClick={onPrevStep}>
            ← Предыдущий шаг сценария
          </button>
        )}
        <button type="button" className="teacher-step-skip-btn" onClick={handleForward}>
          {isLastStep ? 'Завершить просмотр' : 'Следующий шаг без ответа'}
        </button>
      </div>
    </div>
  )
}
