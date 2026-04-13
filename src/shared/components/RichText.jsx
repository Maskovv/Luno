import { Fragment } from 'react'

/**
 * Рендерит фрагменты **текст** как <strong> (как «термины» в учебнике).
 */
export function RichText({ as: Component = 'span', className, children }) {
  const raw = typeof children === 'string' ? children : String(children ?? '')
  const parts = raw.split(/(\*\*[^*]+\*\*)/g)
  const nodes = parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <Fragment key={i}>{part}</Fragment>
  })
  return <Component className={className}>{nodes}</Component>
}
