import './level1.css'

export function Level1Theory({ title, paragraphs, onNext }) {
  return (
    <div className="l1-theory">
      <h2 className="l1-theory-title">{title}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} className="l1-theory-p">
          {p}
        </p>
      ))}
      <button type="button" className="l1-btn-primary" onClick={onNext}>
        Далее →
      </button>
    </div>
  )
}
