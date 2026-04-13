import './level2.css'

export function Level2Theory({ title, bullets = [], glossary = [], onNext }) {
  return (
    <div className="l2-card">
      <h2 className="l2-title">{title || 'Теория'}</h2>

      {bullets.length > 0 && (
        <ul className="l2-list">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {glossary.length > 0 && (
        <div className="l2-glossary">
          {glossary.map((entry) => (
            <p key={entry.term}>
              <strong>{entry.term}:</strong> {entry.def}
            </p>
          ))}
        </div>
      )}

      <button type="button" className="l2-primary" onClick={onNext}>
        Далее →
      </button>
    </div>
  )
}
