import { useMemo, useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import {
  healthyThoughts,
  LUNO_PER_THOUGHT,
  shuffleArray,
  wrongThoughts,
} from './level5Game2Data'

function VkShell({ children }) {
  return (
    <div className="l5-root">
      <div className="l5-vk-top">
        <span className="l5-vk-logo">Vibe</span>
        <div className="l5-vk-search">🔍 Поиск</div>
        <div className="l5-vk-icons" aria-hidden>
          🏠 ☰
        </div>
      </div>
      <div className="l5-vk-body">{children}</div>
    </div>
  )
}

function HintLines({ text }) {
  const lines = String(text || '')
    .split('\n')
    .filter((l) => l.length > 0)
  return (
    <div className="l5-luno-hint-text">
      {lines.map((line, i) => (
        <p key={i}>
          <RichText>{line}</RichText>
        </p>
      ))}
    </div>
  )
}

export function Level5Game2({ onNext }) {
  const allThoughts = useMemo(() => shuffleArray([...wrongThoughts, ...healthyThoughts]), [])
  const [left, setLeft] = useState([])
  const [right, setRight] = useState([])
  const [pick, setPick] = useState('')
  const [stepHint, setStepHint] = useState('')
  const all = [...wrongThoughts, ...healthyThoughts]

  const pool = allThoughts.filter((x) => !left.includes(x) && !right.includes(x))

  const place = (zone) => {
    if (!pick) return
    const targetHealthy = healthyThoughts.includes(pick)
    const correct = (zone === 'wrong' && !targetHealthy) || (zone === 'healthy' && targetHealthy)
    const fb = LUNO_PER_THOUGHT[pick]
    if (fb) {
      setStepHint(correct ? fb.ok : fb.bad)
    } else {
      setStepHint(
        correct
          ? 'Луно:\n— Верно.\nТы правильно выбрала колонку для этой мысли.'
          : 'Луно:\n— Подумай ещё раз: колонка «ошибочные» — для самообвинений и паники, «здоровые» — для опоры и заботы о себе. Сверь смысл фразы с подписью колонки.',
      )
    }
    if (!correct) return
    if (zone === 'wrong') setLeft((s) => [...s, pick])
    else setRight((s) => [...s, pick])
    setPick('')
  }

  const removeFrom = (zone, text) => {
    if (zone === 'wrong') setLeft((s) => s.filter((t) => t !== text))
    else setRight((s) => s.filter((t) => t !== text))
    if (pick === text) setPick('')
    setStepHint('')
  }

  const done = left.length + right.length === all.length
  const ok = wrongThoughts.every((x) => left.includes(x)) && healthyThoughts.every((x) => right.includes(x))

  if (done && ok) {
    return (
      <LunoVictoryScreen
        title="Молодец!"
        onContinue={onNext}
        continueLabel="Вперёд"
        lunoAvatarUrls={LUNO_AVATAR_URLS}
      >
        <p>
          <RichText>
            Ты правильно разделил мысли и показал, как **поддерживать себя** в сложной ситуации.
          </RichText>
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Игра 2: Внутренние мысли</h2>
      <p className="l5-game-hint">
        Фразы в случайном порядке. Выбери мысль и добавь в колонку. Нажми на фразу в колонке, чтобы вернуть её обратно.
      </p>
      <VkShell>
        <div className="l5-feed-heading">
          <h3 className="l5-feed-title">Мои записи</h3>
        </div>
        <div className="l5-thoughts-wrap">
          <div className="l5-thoughts-grid">
            <div className="l5-thought-zone">
              <h4>Ошибочные (разрушающие)</h4>
              {left.map((x) => (
                <button
                  key={x}
                  type="button"
                  className="l5-thought-chip l5-thought-chip-btn"
                  onClick={() => removeFrom('wrong', x)}
                >
                  <span>{x}</span>
                  <span className="l5-remove-x" aria-hidden>
                    ×
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="l5-btn-vk l5-btn-reply"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => place('wrong')}
              >
                Добавить выбранную сюда
              </button>
            </div>
            <div className="l5-thought-zone">
              <h4>Здоровые (поддерживающие)</h4>
              {right.map((x) => (
                <button
                  key={x}
                  type="button"
                  className="l5-thought-chip l5-thought-chip-btn"
                  onClick={() => removeFrom('healthy', x)}
                >
                  <span>{x}</span>
                  <span className="l5-remove-x" aria-hidden>
                    ×
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="l5-btn-vk l5-btn-block"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => place('healthy')}
              >
                Добавить выбранную сюда
              </button>
            </div>
          </div>
          {stepHint && (
            <div className={`l5-luno-hint-block ${stepHint.includes('Верно') ? 'ok' : 'err'}`}>
              <div className="l5-luno-hint-row">
                <LunoPhoto urls={LUNO_AVATAR_URLS} className="l5-luno-hint-face" alt="" />
                <HintLines text={stepHint} />
              </div>
            </div>
          )}
          <div className="l5-thought-pick">
            <strong style={{ display: 'block', marginBottom: 8 }}>Осталось распределить:</strong>
            {pool.map((x) => (
              <label key={x} className="l2-opt">
                <input type="radio" name="thought" checked={pick === x} onChange={() => setPick(x)} />
                {x}
              </label>
            ))}
          </div>
          {done && !ok && (
            <p className="l2-err" style={{ marginTop: 12 }}>
              Есть ошибки. Убери лишние мысли из колонок и распредели заново.
            </p>
          )}
        </div>
      </VkShell>
    </div>
  )
}
