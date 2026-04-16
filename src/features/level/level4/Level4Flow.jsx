import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  flushLevelStepForExit,
  getLevelProgress,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { RichText } from '../../../shared/components/RichText'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import {
  LEVEL4_TITLE,
  level4Flow,
  game1Cases,
  game2Cases,
  fillBlocks,
} from './level4FlowData'
import { Level4Scene2Call } from './Level4Scene2Call'
import { level4UrlsForScene } from './level4Scenes'
import { LUNO_AVATAR_URLS } from '../level1/level1Scenes'
import '../LevelPage.css'
import '../level1/level1.css'
import '../level2/level2.css'
import './level4.css'

const LEVEL_ID = '4'

function Level4Backdrop({ bgKey }) {
  const urls = useMemo(() => (bgKey ? level4UrlsForScene(bgKey) : []), [bgKey])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [bgKey])

  const src = urls[attempt]
  if (!src || attempt >= urls.length) {
    return <div className="l1-backdrop l1-backdrop--empty" aria-hidden />
  }

  return (
    <div className="l1-backdrop" aria-hidden>
      <div className="l1-backdrop-picture">
        <img
          key={src}
          src={src}
          alt=""
          className="l1-backdrop-img"
          loading="eager"
          decoding="async"
          onError={() => setAttempt((a) => a + 1)}
        />
      </div>
    </div>
  )
}

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, i) => (
          <p key={i}>
            <RichText>{line}</RichText>
          </p>
        ))}
      </>
    )
  }
  return (
    <p>
      <RichText>{text}</RichText>
    </p>
  )
}

function arraysEq(a, b) {
  const A = new Set(a)
  const B = new Set(b)
  if (A.size !== B.size) return false
  for (const x of A) if (!B.has(x)) return false
  return true
}

function splitExplainToReplicas(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function LunoModal({ title, text, onClose, isError = false, lunoAvatarUrls }) {
  const raw = String(text || '')
  const lines = raw.includes('\n') ? raw.split('\n').filter(Boolean) : [raw]
  return (
    <div className="l2-modal-backdrop" role="presentation">
      <div className="l2-modal l4-modal">
        <div className="l4-modal-avatar">
          {lunoAvatarUrls?.length ? (
            <LunoPhoto urls={lunoAvatarUrls} className="l4-luno-photo-circle" alt="" />
          ) : (
            <CharacterAvatar name="Луно" />
          )}
        </div>
        <div className="l2-modal-title">{title}</div>
        <div className="l2-modal-body">
          {lines.map((line, i) => (
            <p key={i}>
              <RichText>{line}</RichText>
            </p>
          ))}
        </div>
        <div className="l2-modal-actions">
          <button type="button" className={isError ? 'l4-btn-ghost' : 'l2-primary'} onClick={onClose}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  )
}

function CasePreview({ data }) {
  if (data.kind === 'sms') {
    return (
      <div className="l4-phone">
        <div className="l4-row">
          <strong>От кого:</strong> {data.from}
        </div>
        <div className="l4-msg">{data.text}</div>
      </div>
    )
  }
  if (data.kind === 'email') {
    return (
      <div className="l4-mail">
        <div className="l4-row">
          <strong>От кого:</strong> {data.from}
        </div>
        <div className="l4-row">
          <strong>Тема:</strong> {data.subject}
        </div>
        <div className="l4-msg">{data.text}</div>
      </div>
    )
  }
  if (data.kind === 'payment') {
    return (
      <div className="l4-pay">
        <div className="l4-pay-bar">
          {data.secure ? '🔒' : '⚠'} {data.addr}
        </div>
        <div className="l4-pay-body">
          <div className="l4-field">Имя</div>
          <div className="l4-field">Карта</div>
          <div className="l4-field">Срок / CCV</div>
        </div>
      </div>
    )
  }
  return <div className="l4-msg-card">{data.text}</div>
}

function Game1({ onNext }) {
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState('')
  const [modal, setModal] = useState(null)
  const [done, setDone] = useState(false)
  const cur = game1Cases[idx]

  const submit = () => {
    if (!pick) return
    const ok = pick === cur.real
    if (ok) {
      setModal({
        ok: true,
        phase: 'first',
        title: 'Почему так',
        text: cur.wrongExplain,
        isError: false,
      })
    } else {
      setModal({
        ok: false,
        phase: 'only',
        title: 'Неверно :(',
        text: cur.wrongExplain,
        isError: true,
      })
    }
  }

  const closeModal = () => {
    if (!modal) return
    if (!modal.ok) {
      setModal(null)
      return
    }
    if (modal.phase === 'first') {
      setModal({
        ok: true,
        phase: 'second',
        title: 'Верно! Молодец!',
        text: cur.rightExplain,
        isError: false,
      })
      return
    }
    if (modal.phase === 'second') {
      setModal(null)
      setPick('')
      if (idx === game1Cases.length - 1) {
        setDone(true)
        return
      }
      setIdx((i) => i + 1)
    }
  }

  if (done) {
    return (
      <LunoVictoryScreen
        title="Отлично!"
        onContinue={onNext}
        continueLabel="Вперёд"
        lunoAvatarUrls={LUNO_AVATAR_URLS}
      >
        <p>
          <RichText>
            Ты завершил игру 1 и успешно разобрал **базовые схемы финансового мошенничества**.
          </RichText>
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Игра 1: Определи настоящее сообщение</h2>
      <p className="l2-sub">
        <strong>{cur.title}</strong>
      </p>
      <div className="l4-pair">
        <button
          type="button"
          className={`l4-case ${pick === 'left' ? 'active' : ''}`}
          onClick={() => setPick('left')}
        >
          <CasePreview data={cur.left} />
        </button>
        <button
          type="button"
          className={`l4-case ${pick === 'right' ? 'active' : ''}`}
          onClick={() => setPick('right')}
        >
          <CasePreview data={cur.right} />
        </button>
      </div>
      <div className="l4-actions">
        <button
          type="button"
          className={`l4-choose ${pick === 'left' ? 'active' : ''}`}
          onClick={() => setPick('left')}
        >
          Настоящий
        </button>
        <button
          type="button"
          className={`l4-choose ${pick === 'right' ? 'active' : ''}`}
          onClick={() => setPick('right')}
        >
          Настоящий
        </button>
      </div>
      <button type="button" className="l2-primary" onClick={submit}>
        Проверить
      </button>
      <p className="l2-progress">
        {idx + 1} / {game1Cases.length}
      </p>
      {modal && (
        <LunoModal
          title={modal.title}
          text={modal.text}
          onClose={closeModal}
          isError={modal.isError}
          lunoAvatarUrls={LUNO_AVATAR_URLS}
        />
      )}
    </div>
  )
}

function Game2({ onNext }) {
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState([])
  const [modal, setModal] = useState(null)
  const [replicaIdx, setReplicaIdx] = useState(0)
  const [done, setDone] = useState(false)
  const cur = game2Cases[idx]
  const isSingle = cur.correct.length === 1
  const toggle = (o) => setPick((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))

  const submit = () => {
    if (!arraysEq(pick, cur.correct)) {
      setModal({ ok: false, text: cur.wrongExplain || 'Попробуй ещё раз.' })
      setReplicaIdx(0)
      return
    }
    setModal({ ok: true, text: cur.explain })
    setReplicaIdx(0)
  }

  const nextCase = () => {
    const wasOk = modal?.ok
    if (!wasOk) {
      setModal(null)
      return
    }
    const replicas = splitExplainToReplicas(modal?.text)
    if (replicaIdx < replicas.length - 1) {
      setReplicaIdx((i) => i + 1)
      return
    }
    setModal(null)
    setReplicaIdx(0)
    setPick([])
    if (idx === game2Cases.length - 1) {
      setDone(true)
      return
    }
    setIdx((i) => i + 1)
  }

  if (done) {
    return (
      <LunoVictoryScreen
        title="Молодец!"
        onContinue={onNext}
        continueLabel="Вперёд"
        lunoAvatarUrls={LUNO_AVATAR_URLS}
      >
        <p>
          <RichText>
            Игра 2 пройдена. Ты потренировался выбирать **безопасные действия** в разных ситуациях.
          </RichText>
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Игра 2: Выбери безопасное действие</h2>
      <p className="l2-sub">
        <strong>{cur.title}.</strong>{' '}
        <RichText>{cur.msg}</RichText>
      </p>
      <div className="l2-opts">
        {cur.options.map((o) => (
          <label key={o} className="l2-opt">
            <input
              type={isSingle ? 'radio' : 'checkbox'}
              name={`g2_${idx}`}
              checked={pick.includes(o)}
              onChange={() => (isSingle ? setPick([o]) : toggle(o))}
            />{' '}
            {o}
          </label>
        ))}
      </div>
      <button type="button" className="l2-primary" onClick={submit}>
        Проверить
      </button>
      <p className="l2-progress">
        {idx + 1} / {game2Cases.length}
      </p>
      {modal && (
        <LunoModal
          title={modal.ok ? 'Верно! Молодец!' : 'Неверно :('}
          text={modal.ok ? splitExplainToReplicas(modal.text)[replicaIdx] || '' : modal.text}
          onClose={nextCase}
          isError={!modal.ok}
          lunoAvatarUrls={LUNO_AVATAR_URLS}
        />
      )}
    </div>
  )
}

function Test({ onComplete }) {
  const [fills, setFills] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState('')
  const randomized = useMemo(
    () => fillBlocks.map((b) => ({ ...b, bank: [...b.bank].sort(() => Math.random() - 0.5) })),
    [],
  )
  const ok = fillBlocks.every((b, bi) => b.ans.every((x, i) => (fills[`${bi}_${i}`] || '') === x))
  const allOk = submitted && ok

  const isCurrentStepCorrect = () =>
    fillBlocks[step].ans.every((x, i) => (fills[`${step}_${i}`] || '') === x)

  const goNext = () => {
    if (!isCurrentStepCorrect()) {
      setStepError('Неверно. Исправь пропуски, чтобы перейти дальше.')
      return
    }
    setStepError('')
    setStep((s) => s + 1)
  }

  if (allOk) {
    return (
      <LunoVictoryScreen
        title="Уровень 4 пройден!"
        onContinue={onComplete}
        continueLabel="К выбору уровней"
        lunoAvatarUrls={LUNO_AVATAR_URLS}
      >
        <p>
          <RichText>
            Отлично! Ты разобрал **схемы финансового мошенничества** и закрепил **правила безопасного поведения**.
          </RichText>
        </p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-progress">
        Шаг {step + 1} из {fillBlocks.length}
      </p>
      <div className="l2-q">
        <p className="l2-q-title">
          <RichText>{fillBlocks[step].title}</RichText>
        </p>
        <p className="l2-sub">Слова: {randomized[step].bank.join(', ')}</p>
        {fillBlocks[step].lines.map((ln, i) => (
          <p key={i} className="l-test-fill-line">
            {ln[0]}{' '}
            <select
              value={fills[`${step}_${i}`] || ''}
              onChange={(e) => {
                setStepError('')
                setFills({ ...fills, [`${step}_${i}`]: e.target.value })
              }}
            >
              <option value="">— выберите —</option>
              {randomized[step].bank.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>{' '}
            {ln[1]}
          </p>
        ))}
      </div>
      <div className="l2-test-nav">
        {step > 0 && (
          <button type="button" className="back-button" onClick={() => setStep((s) => s - 1)}>
            Назад
          </button>
        )}
        {step < fillBlocks.length - 1 ? (
          <button type="button" className="l2-primary" onClick={goNext}>
            Далее
          </button>
        ) : (
          <button type="button" className="l2-primary" onClick={() => setSubmitted(true)}>
            Проверить
          </button>
        )}
      </div>
      {stepError && <p className="l2-err">{stepError}</p>}
      {submitted && !allOk && <p className="l2-err">Есть ошибки. Исправь и проверь снова.</p>}
    </div>
  )
}

export function Level4Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelProgress(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < level4Flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const save = async (n) => {
    setStep(n)
    if (user) await setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => void save(step + 1)
  const prev = () => void save(Math.max(0, step - 1))

  const exitToLevels = async () => {
    await flushLevelStepForExit(user?.uid, LEVEL_ID, step)
    navigate('/levels')
  }

  const finish = async () => {
    if (user) {
      await Promise.all([
        unlockNextLevel(user.uid, 5),
        completeLevelInDb(user.uid, LEVEL_ID),
        setLevelStep(user.uid, LEVEL_ID, 0),
      ])
    }
    navigate('/levels')
  }

  const item = level4Flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = level4Flow.length
  const teacherExitPreview = () => void exitToLevels()

  const prevBtn = step > 0 && (
    <div className="scenario-prev-wrap">
      <button type="button" className="scenario-prev-btn" onClick={prev}>
        ← Предыдущий шаг сценария
      </button>
    </div>
  )

  const teacherSkip = !roleLoading && (
    <TeacherStepSkip
      isTeacher={isTeacher}
      isLastStep={step >= flowLen - 1}
      onSkipStep={next}
      onEndPreview={teacherExitPreview}
    />
  )

  const isCinematicDialogue = item.type === 'dialogue' && item.bgKey

  if (item.type === 'scene2call') {
    return (
      <>
        <Level4Scene2Call
          onNext={next}
          onScenarioPrev={prev}
          flowStep={step}
          onBackToLevels={() => void exitToLevels()}
        />
        {teacherSkip}
      </>
    )
  }

  if (isCinematicDialogue) {
    return (
      <div className="level-page level-page--l4 level-page--l1-cinematic">
        <div className="l1-cinematic-root">
          <Level4Backdrop key={step} bgKey={item.bgKey} />
          <div className="l1-cinematic-chrome" onClick={(e) => e.stopPropagation()}>
            <div className="level-header">
              <button type="button" className="back-button" onClick={() => void exitToLevels()}>
                ← Назад
              </button>
              <h1>{LEVEL4_TITLE}</h1>
            </div>
            {prevBtn}
          </div>
          <div
            className="l1-cinematic-body l1-cinematic-body--dialogue"
            onClick={next}
            role="presentation"
          >
            <div className="dialogue-section l1-dialogue-cinematic">
              <div className="dialogue-bubble l1-dialogue-bubble-glass">
                <p className="l1-dialogue-speaker">{item.character}</p>
                <DialogueLines text={item.text} />
              </div>
              <div className="level-actions l1-cinematic-actions">
                <button
                  type="button"
                  className="next-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                >
                  Далее →
                </button>
                <p className="l1-tap-hint">или щёлкни по экрану</p>
              </div>
            </div>
          </div>
        </div>
        {teacherSkip}
      </div>
    )
  }

  return (
    <div className="level-page level-page--l4">
      <div className="level-container l2-wide">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => void exitToLevels()}>
            ← Назад
          </button>
          <h1>{LEVEL4_TITLE}</h1>
        </div>
        {prevBtn}

        {item.type === 'splash' && (
          <GameSplashScreen
            title={item.title}
            paragraphs={item.paragraphs}
            closing={item.closing}
            buttonText={item.buttonText}
            onContinue={next}
            lunoAvatarUrls={LUNO_AVATAR_URLS}
          />
        )}

        {item.type === 'game1' && <Game1 onNext={next} />}
        {item.type === 'game2' && <Game2 onNext={next} />}
        {item.type === 'test' && <Test onComplete={finish} />}
      </div>
      {teacherSkip}
    </div>
  )
}
