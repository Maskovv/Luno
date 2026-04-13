import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { completeLevel as completeLevelInDb, getLevelState, setLevelStep } from '../../../shared/api/firestoreProgress'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import '../LevelPage.css'
import '../level2/level2.css'
import './level5.css'

const LEVEL_ID = '5'
const TITLE = 'Уровень 5. Кибербуллинг'

const flow = [
  { t: 'd', c: 'Маша', x: 'Они начали писать про меня... сначала шутили, а теперь не останавливаются.' },
  { t: 'd', c: 'Луно', x: 'Вы столкнулись с кибербуллингом — травлей в сети. Поможем Маше защитить себя.' },
  { t: 'game1' },
  { t: 'game2' },
  { t: 'd', c: 'Маша', x: '— Значит… это не потому, что со мной что-то не так?..' },
  { t: 'd', c: 'Луно', x: '— Нет.\nКибербуллинг — это поведение других людей, а не твоя вина.' },
  { t: 'd', c: 'Маша', x: '— Мне стало немного легче…' },
  {
    t: 'd',
    c: 'Луно',
    x: '— Помни, мысли могут усиливать боль или помогать справиться с ней. И не забывай, что ты не одна, у тебя есть друзья и семья.',
  },
  { t: 'game3' },
  { t: 'final' },
]

const comments = [
  'Это кринж',
  'Ты вообще видела себя?',
  'Удались отсюда',
  'Смешно даже смотреть',
]

const wrongThoughts = [
  'Это всё из-за меня... зачем я выложила этот пост',
  'Если надо мной смеются, значит я правда плохая',
  'Может я правда некрасивая?',
  'Лучше удалить страницу',
  'Я неудачница',
  'Никто не захочет со мной общаться',
  'А если и родители скажут, что я сама виновата?',
  'Может мой пост и правда кринж?',
  'Если я отвечу, станет хуже — значит нужно терпеть',
]

const healthyThoughts = [
  'Это неприятно, но это не определяет меня',
  'Я не обязана терпеть такое отношение',
  'Я могу попросить помощи',
  'Это их поведение — их ответственность',
  'Я могу защитить себя',
  'Всё, что они говорят обо мне, больше говорит о них',
  'Главное, что мне нравится мой пост',
  'У меня есть близкие люди, и только к их мнению стоит прислушаться',
  'Их жизнь слишком скучна, раз они решили влезть в мою',
  'Главное, что я знаю, что я хороший человек',
]

function shuffleArray(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Подсказка после каждого хода: ok — верная колонка, bad — перепутал колонки */
const LUNO_PER_THOUGHT = {
  'Это всё из-за меня... зачем я выложила этот пост': {
    ok: 'Луно:\n— Верно.\nТакая мысль часто приходит первой, но пост — не причина травли. Важно отнести её к «ошибочным», а не к правде о тебе.',
    bad: 'Луно:\n— Эта фраза про самообвинение и стыд — её место среди разрушающих мыслей, а не среди поддерживающих.',
  },
  'Если надо мной смеются, значит я правда плохая': {
    ok: 'Луно:\n— Верно.\nСмех толпы не доказательство твоих качеств. Это типичная ловушка: смешно ≠ ты плохая.',
    bad: 'Луно:\n— Подожди.\nЭто как раз мысль, которая приравнивает травлю к правде о тебе — её нужно в колонку ошибочных.',
  },
  'Может я правда некрасивая?': {
    ok: 'Луно:\n— Верно.\nТак сомневаются многие после атак. Это не факт, а раненая самооценка — правильно положить в ошибочные.',
    bad: 'Луно:\n— Это не «здоровая» мысль, а удар по себе. Её место — среди разрушающих, чтобы потом заменить на бережные.',
  },
  'Лучше удалить страницу': {
    ok: 'Луно:\n— Верно.\nУйти из сети иногда хочется сразу — это импульс, но решение лучше обсудить с близкими, а не винить себя.',
    bad: 'Луно:\n— Это не опора и не забота о себе в формулировке «здоровой» мысли — скорее паника. Вернём в ошибочные?',
  },
  'Я неудачница': {
    ok: 'Луно:\n— Верно.\nОдин ярлык «неудачница» не делает тебя такой — это обесценивание после травли.',
    bad: 'Луно:\n— Это жёсткая ярлык-мысль, не поддержка. Она относится к разрушающим, а не к «здоровым».',
  },
  'Никто не захочет со мной общаться': {
    ok: 'Луно:\n— Верно.\nСтрах отвержения после буллинга очень понятен — но это катастрофизация, не прогноз.',
    bad: 'Луно:\n— Это не про твою ценность и не здоровая уверенность. Такие мысли — в колонку ошибочных.',
  },
  'А если и родители скажут, что я сама виновата?': {
    ok: 'Луно:\n— Верно.\nСтрах перед реакцией взрослых — нормальный, но он не делает тебя виноватой в буллинге.',
    bad: 'Луно:\n— Это тревога и стыд, а не мысль, которая тебя поддерживает. Место — среди ошибочных.',
  },
  'Может мой пост и правда кринж?': {
    ok: 'Луно:\n— Верно.\nТролли цепляются к чему угодно — это не объективная оценка твоего поста.',
    bad: 'Луно:\n— Это сомнение в себе под давлением, не конструктивная поддержка. Не в «здоровые».',
  },
  'Если я отвечу, станет хуже — значит нужно терпеть': {
    ok: 'Луно:\n— Верно.\nТерпеть насилие в словах — не обязанность; это как раз разрушающая установка.',
    bad: 'Луно:\n— «Терпеть» — опасная норма. Эта мысль не про заботу о себе, а про самопожертвование — в ошибочные.',
  },
  'Это неприятно, но это не определяет меня': {
    ok: 'Луно:\n— Верно.\nТы отделяешь ситуацию от своей личности — это здоровая опора.',
    bad: 'Луно:\n— Это как раз поддерживающая мысль, а не самообвинение. Её место — среди здоровых.',
  },
  'Я не обязана терпеть такое отношение': {
    ok: 'Луно:\n— Верно.\nГраницы и уважение к себе — важная часть защиты.',
    bad: 'Луно:\n— Это не разрушительная мысль — наоборот, она тебя защищает. Перенеси в здоровые.',
  },
  'Я могу попросить помощи': {
    ok: 'Луно:\n— Верно.\nПросить помощь — сила, а не слабость.',
    bad: 'Луно:\n— Это конструктивная мысль, не про вину. Она относится к поддерживающим.',
  },
  'Это их поведение — их ответственность': {
    ok: 'Луно:\n— Верно.\nТы возвращаешь ответственность туда, где ей место.',
    bad: 'Луно:\n— Это не самообвинение — это ясность. Такие фразы — в колонку здоровых.',
  },
  'Я могу защитить себя': {
    ok: 'Луно:\n— Верно.\nПамять о своих возможностях помогает не застревать в бессилии.',
    bad: 'Луно:\n— Это не разрушающая мысль. Она про ресурс — положи в здоровые.',
  },
  'Всё, что они говорят обо мне, больше говорит о них': {
    ok: 'Луно:\n— Верно.\nТак можно снизить вес чужих ярлыков.',
    bad: 'Луно:\n— Это не ошибка и не «плохая» установка — это здоровый взгляд. В здоровые.',
  },
  'Главное, что мне нравится мой пост': {
    ok: 'Луно:\n— Верно.\nОпора на своё мнение важнее шумных комментариев.',
    bad: 'Луно:\n— Это не разрушение себя, а опора на себя — в здоровые мысли.',
  },
  'У меня есть близкие люди, и только к их мнению стоит прислушаться': {
    ok: 'Луно:\n— Верно.\nВыбирать, чьё мнение важно — это забота о себе.',
    bad: 'Луно:\n— Это не токсичная мысль — она про поддержку. Место среди здоровых.',
  },
  'Их жизнь слишком скучна, раз они решили влезть в мою': {
    ok: 'Луно:\n— Верно.\nИногда помогает сместить фокус: агрессия часто говорит о них, не о тебе.',
    bad: 'Луно:\n— Это не самоуничижение — скорее ироничная защита. В здоровые.',
  },
  'Главное, что я знаю, что я хороший человек': {
    ok: 'Луно:\n— Верно.\nЦенность не отменяется чужими оскорблениями.',
    bad: 'Луно:\n— Это не разрушающая мысль — она про твою опору на себя. В здоровые.',
  },
}

const ANYA_MASHA_CHAT = [
  { who: 'Аня', text: 'Привет! Не понимаю, что происходит, почему они накинулись на меня… мне страшно.' },
  {
    who: 'Маша',
    text: 'Да… Меня тоже они раздражают. Но ты не переживай, всё, что они сказали, полный бред.',
  },
  { who: 'Аня', text: 'Они не отстают(( Может следует удалить страницу…' },
  {
    who: 'Маша',
    text: 'Аня, а где же мы будем общаться, да и здесь все учебные чаты.',
  },
  {
    who: 'Аня',
    text: 'Ты права… Наверное, закрою страницу или ограничу доступ для тех, кто может писать мне и на моей странице.',
  },
]

function lunoBarClass(text) {
  if (!text) return ''
  if (/Верно|Молодец|Отлично/i.test(text)) return 'ok'
  if (/плохо|опасн|не вариант|усилит|бесполезн|не оставлять/i.test(text)) return 'err'
  return 'neutral'
}

function LunoMsg({ text }) {
  const cls = lunoBarClass(text)
  return <div className={`l5-luno-bar ${cls}`}>{text}</div>
}

function VkShell({ children, title = 'Профиль' }) {
  return (
    <div className="l5-root">
      <div className="l5-vk-top">
        <span className="l5-vk-logo">VK</span>
        <div className="l5-vk-search">🔍 Поиск</div>
        <div className="l5-vk-icons" aria-hidden>🏠 ☰</div>
      </div>
      <div className="l5-vk-body">
        {title && <p className="l5-feed-title" style={{ marginTop: 0 }}>{title}</p>}
        {children}
      </div>
    </div>
  )
}

function Game1({ onNext }) {
  const [blocked, setBlocked] = useState([])
  const [msg, setMsg] = useState('')
  const [showBadDialog, setShowBadDialog] = useState(false)
  const [phase, setPhase] = useState('comments')
  const [dmState, setDmState] = useState({ trollBlocked: false, friendReplied: false })
  const [threatDone, setThreatDone] = useState(false)

  const block = (c) => {
    if (blocked.includes(c)) return
    setBlocked([...blocked, c])
    setMsg('Луно: Молодец! Лучше сразу блокировать троллей.')
    if (blocked.length + 1 === comments.length) {
      setPhase('messages')
      setMsg('Луно: Отлично. Теперь появились новые сообщения: одно от тролля, второе от друга.')
    }
  }

  const reply = () => {
    setShowBadDialog(true)
    setMsg('Луно: Ответ может усилить конфликт. Иногда лучше не вовлекаться.')
  }

  const doneDm = dmState.trollBlocked && dmState.friendReplied

  const threatChoice = (type) => {
    if (type === 'parents') {
      setThreatDone(true)
      setMsg('Луно: Верно. При угрозах и сливе личных данных важно сразу рассказать родителям.')
      return
    }
    if (type === 'find') {
      setMsg('Луно: Вероятнее всего, это не поможет избавиться от угроз. Безопаснее звать взрослых.')
      return
    }
    setMsg('Луно: Блокировка важна, но при угрозах и сливе данных этого может быть недостаточно.')
  }

  const threatComments = [
    'Лёше ты никогда не понравишься… Если будешь с ним общаться, я найду тебя! Я знаю, где ты живёшь.',
    'Жди свой номер в позорном паблике… Если не веришь, что я знаю твой номер — ты ошибаешься: 89526784511',
    'Будешь выпендриваться — я всем расскажу твой секрет. Тогда мы все над тобой посмеёмся.',
    'В 33 школе все такие глупые, как ты?',
  ]

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Игра 1: Страница Маши</h2>
      <p className="l5-game-hint">
        {phase === 'comments' && 'Заблокируй всех троллей под постом. Отвечать опаснее — диалог может обостриться.'}
        {phase === 'messages' && !doneDm && 'Новые сообщения: заблокируй тролля и ответь другу.'}
        {doneDm && !threatDone && 'Появились угрозы и слив данных. Выбери безопасное действие.'}
        {threatDone && 'Этап пройден. Переходи дальше.'}
      </p>

      <VkShell title="">
        <div className="l5-vk-grid">
          <aside className="l5-profile-card">
            <div className="l5-profile-avatar">
              <CharacterAvatar name="Маша" />
            </div>
            <p className="l5-profile-name">Маша</p>
            <div className="l5-profile-meta">
              Дата рождения: 12 мая
              <br />
              Образование: СОШ №33
            </div>
            <div className="l5-profile-icons" aria-hidden>👤 🎵 💬</div>
          </aside>
          <main>
            <h3 className="l5-feed-title">Мои записи</h3>
            {phase === 'comments' && (
              <article className="l5-post">
                <div className="l5-post-preview">Пост Маши</div>
                {comments.map((c) => (
                  <div key={c} className="l5-comment-row">
                    <span className="l5-comment-text">{c}</span>
                    <div className="l5-comment-actions">
                      {blocked.includes(c) ? (
                        <span className="l5-badge-done">✓ Заблокирован</span>
                      ) : (
                        <>
                          <button type="button" className="l5-btn-vk l5-btn-block" onClick={() => block(c)}>
                            Заблокировать
                          </button>
                          <button type="button" className="l5-btn-vk l5-btn-reply" onClick={reply}>
                            Ответить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </article>
            )}

            {phase === 'messages' && !doneDm && (
              <div className="l5-msg-list">
                <p className="l5-section-title">Мои сообщения</p>
                <div className="l5-msg-card">
                  <div className="l5-msg-avatar">😈</div>
                  <div className="l5-msg-body">
                    <div className="l5-msg-name">Тролль_99</div>
                    <div className="l5-msg-text">Ну ты и трусиха… Реально всех уже бесишь.</div>
                    <div className="l5-comment-actions" style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="l5-btn-vk l5-btn-block"
                        onClick={() => setDmState((s) => ({ ...s, trollBlocked: true }))}
                        disabled={dmState.trollBlocked}
                      >
                        {dmState.trollBlocked ? '✓ Заблокирован' : 'Заблокировать'}
                      </button>
                      <button
                        type="button"
                        className="l5-btn-vk l5-btn-reply"
                        onClick={() => setMsg('Луно: Спорить с троллями бесполезно, они только этого и ждут.')}
                      >
                        Ответить
                      </button>
                    </div>
                  </div>
                </div>
                <div className="l5-msg-card" style={{ background: 'var(--vk-post-dark)' }}>
                  <div className="l5-msg-avatar">
                    <CharacterAvatar name="Ваня" />
                  </div>
                  <div className="l5-msg-body">
                    <div className="l5-msg-name">Ваня</div>
                    <div className="l5-msg-text">
                      Привет, Маша, как ты? Ты быстро ушла после школы — всё в порядке?
                    </div>
                    <div className="l5-comment-actions" style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="l5-btn-vk l5-btn-block"
                        onClick={() => setDmState((s) => ({ ...s, friendReplied: true }))}
                        disabled={dmState.friendReplied}
                      >
                        {dmState.friendReplied ? '✓ Ответил' : 'Ответить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {doneDm && !threatDone && (
              <>
                <p className="l5-section-title">Комментарии под постом</p>
                {threatComments.map((t) => (
                  <div key={t} className="l5-threat-box">
                    <p>{t}</p>
                  </div>
                ))}
                <div className="l5-actions-stack">
                  <button type="button" className="l5-btn-threat" onClick={() => threatChoice('find')}>
                    Узнать, откуда они всё знают
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => threatChoice('block')}>
                    Заблокировать всех
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => threatChoice('parents')}>
                    Рассказать родителям
                  </button>
                </div>
              </>
            )}

            {threatDone && (
              <div className="l5-post" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--vk-blue)' }}>Сложная ситуация пройдена.</p>
              </div>
            )}
          </main>
        </div>
      </VkShell>

      {showBadDialog && (
        <div className="l5-modal-backdrop" role="dialog" aria-modal="true">
          <div className="l5-modal">
            <div className="l5-modal-avatar">
              <CharacterAvatar name="Луно" />
            </div>
            <h3>Неприятный диалог</h3>
            <p>
              <strong>Маша:</strong> Зачем вы это пишете! Сами не лучше!
            </p>
            <p>
              <strong>Тролль:</strong> Хаха, ты ещё заплачь! Ты всегда будешь посмешищем!
            </p>
            <button type="button" className="l5-btn-threat" style={{ marginTop: 8 }} onClick={() => setShowBadDialog(false)}>
              Попробовать снова
            </button>
          </div>
        </div>
      )}

      {msg && <LunoMsg text={msg} />}
      {threatDone && (
        <div className="l5-next-bar">
          <button type="button" className="l5-btn-primary" onClick={onNext}>
            Далее
          </button>
        </div>
      )}
    </div>
  )
}

function Game2({ onNext }) {
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
          ? 'Луно:\n— Верно.\nТы не обязана терпеть такое отношение.\n— Важно помнить о своей ценности.'
          : 'Луно:\n— Эти мысли могут казаться правдой, но на самом деле это нормальная первая реакция на травлю. Главное, вовремя понять, что дело не в вас.\n— Важно не обвинять себя.',
      )
    }
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

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Игра 2: Внутренние мысли</h2>
      <p className="l5-game-hint">
        Фразы в случайном порядке. Выбери мысль и добавь в колонку. Нажми на фразу в колонке, чтобы вернуть её обратно.
      </p>
      <VkShell title="">
        <div className="l5-thoughts-wrap">
          <div className="l5-thoughts-grid">
            <div className="l5-thought-zone">
              <h4>Ошибочные (разрушающие)</h4>
              {left.map((x) => (
                <button key={x} type="button" className="l5-thought-chip l5-thought-chip-btn" onClick={() => removeFrom('wrong', x)}>
                  <span>{x}</span>
                  <span className="l5-remove-x" aria-hidden>
                    ×
                  </span>
                </button>
              ))}
              <button type="button" className="l5-btn-vk l5-btn-reply" style={{ width: '100%', marginTop: 8 }} onClick={() => place('wrong')}>
                Добавить выбранную сюда
              </button>
            </div>
            <div className="l5-thought-zone">
              <h4>Здоровые (поддерживающие)</h4>
              {right.map((x) => (
                <button key={x} type="button" className="l5-thought-chip l5-thought-chip-btn" onClick={() => removeFrom('healthy', x)}>
                  <span>{x}</span>
                  <span className="l5-remove-x" aria-hidden>
                    ×
                  </span>
                </button>
              ))}
              <button type="button" className="l5-btn-vk l5-btn-block" style={{ width: '100%', marginTop: 8 }} onClick={() => place('healthy')}>
                Добавить выбранную сюда
              </button>
            </div>
          </div>
          {stepHint && (
            <div className={`l5-luno-hint-block ${stepHint.includes('Верно') ? 'ok' : 'err'}`}>{stepHint}</div>
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
          {done && !ok && <p className="l2-err" style={{ marginTop: 12 }}>Есть ошибки. Убери лишние мысли из колонок и распредели заново.</p>}
          {done && ok && (
            <div className="l5-post" style={{ marginTop: 14, textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', color: 'var(--vk-text)' }}>
                Отлично! Дело не в Маше — важно поддерживать себя и просить помощи.
              </p>
            </div>
          )}
        </div>
      </VkShell>
      {done && ok && (
        <div className="l5-next-bar">
          <button type="button" className="l5-btn-primary" onClick={onNext}>
            Далее
          </button>
        </div>
      )}
    </div>
  )
}

function Game3({ onNext }) {
  const [g3phase, setG3phase] = useState('strategy')
  const [privacy, setPrivacy] = useState({
    dm: '',
    comments: '',
    posts: '',
    geo: '',
  })
  const [msg, setMsg] = useState('')
  const donePrivacy =
    ['Все друзья', 'Некоторые друзья'].includes(privacy.dm) &&
    ['Все друзья', 'Только я', 'Некоторые друзья'].includes(privacy.comments) &&
    ['Все друзья', 'Только я', 'Некоторые друзья'].includes(privacy.posts) &&
    ['Только я', 'Некоторые друзья'].includes(privacy.geo)

  return (
    <div className="l2-card">
      <h2 className="l5-game-title">Игра 3: Страница Ани</h2>
      <p className="l5-game-hint">
        Помоги подруге: выбери стратегию, прочитай переписку с Аней и настрой приватность.
      </p>
      <VkShell title="">
        <div className="l5-vk-grid">
          <aside className="l5-profile-card">
            <div className="l5-profile-avatar" style={{ background: '#e8f4e8' }}>
              <span style={{ fontSize: '2.5rem' }} aria-hidden>
                А
              </span>
            </div>
            <p className="l5-profile-name">Аня</p>
            <div className="l5-profile-meta">
              Дата рождения: 3 марта
              <br />
              Образование: СОШ №33
            </div>
            <div className="l5-profile-icons" aria-hidden>
              👤 🎵 💬
            </div>
          </aside>
          <main>
            <h3 className="l5-feed-title">Записи Ани</h3>
            {g3phase === 'strategy' && (
              <>
                <div className="l5-mini-post">
                  <strong>Тролль:</strong> «Фу, фотошоп. А без фильтров слабо?»
                </div>
                <div className="l5-mini-post">
                  <strong>Тролль:</strong> «Типо крутая, была в Москве… Красная площадь не исправит фото с твоим лицом»
                </div>
                <div className="l5-actions-stack">
                  <button type="button" className="l5-btn-threat" onClick={() => setMsg('Луно: Поддерживать тролля — точно не вариант.')}>
                    Поддержать тролля
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setMsg('Луно: Спорить с троллями бесполезно, они только этого и ждут.')}>
                    Поддержать Аню в споре
                  </button>
                  <button
                    type="button"
                    className="l5-btn-threat"
                    onClick={() => {
                      setG3phase('dialogue')
                      setMsg('Луно: Хороший выбор. Прочитай переписку с Аней и помоги ей настроить страницу.')
                    }}
                  >
                    Пожаловаться и поддержать Аню
                  </button>
                </div>
              </>
            )}

            {g3phase === 'dialogue' && (
              <div className="l5-chat-thread">
                <p style={{ marginTop: 0, fontWeight: 700, color: 'var(--vk-blue)' }}>Личные сообщения (ты играешь за Машу)</p>
                {ANYA_MASHA_CHAT.map((line) => (
                  <div key={`${line.who}-${line.text}`} className={`l5-chat-line ${line.who === 'Аня' ? 'anya' : 'masha'}`}>
                    <strong>{line.who}</strong>
                    {line.text}
                  </div>
                ))}
                <button type="button" className="l5-btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => setG3phase('privacy')}>
                  Перейти к настройкам приватности
                </button>
              </div>
            )}

            {g3phase === 'privacy' && (
              <div className="l5-privacy-form">
                <p style={{ marginTop: 0, fontWeight: 800, color: 'var(--vk-blue)' }}>Настройки приватности</p>
                <p className="l5-game-hint" style={{ marginBottom: 12 }}>
                  Луно: помоги Ане ограничить доступ к странице.
                </p>
                <div className="l5-privacy-row">
                  <label>Кто может писать личные сообщения</label>
                  <select value={privacy.dm} onChange={(e) => setPrivacy({ ...privacy, dm: e.target.value })}>
                    <option value="">— выберите —</option>
                    <option>Все пользователи</option>
                    <option>Друзья и друзья друзей</option>
                    <option>Все друзья</option>
                    <option>Никто</option>
                    <option>Некоторые друзья</option>
                  </select>
                </div>
                <div className="l5-privacy-row">
                  <label>Кто может комментировать посты</label>
                  <select value={privacy.comments} onChange={(e) => setPrivacy({ ...privacy, comments: e.target.value })}>
                    <option value="">— выберите —</option>
                    <option>Все пользователи</option>
                    <option>Друзья и друзья друзей</option>
                    <option>Все друзья</option>
                    <option>Только я</option>
                    <option>Некоторые друзья</option>
                  </select>
                </div>
                <div className="l5-privacy-row">
                  <label>Кто может публиковать посты в профиле</label>
                  <select value={privacy.posts} onChange={(e) => setPrivacy({ ...privacy, posts: e.target.value })}>
                    <option value="">— выберите —</option>
                    <option>Все пользователи</option>
                    <option>Друзья и друзья друзей</option>
                    <option>Все друзья</option>
                    <option>Только я</option>
                    <option>Некоторые друзья</option>
                  </select>
                </div>
                <div className="l5-privacy-row">
                  <label>Кто видит геолокацию фотографий</label>
                  <select value={privacy.geo} onChange={(e) => setPrivacy({ ...privacy, geo: e.target.value })}>
                    <option value="">— выберите —</option>
                    <option>Все пользователи</option>
                    <option>Друзья и друзья друзей</option>
                    <option>Все друзья</option>
                    <option>Только я</option>
                    <option>Некоторые друзья</option>
                  </select>
                </div>
                {donePrivacy && (
                  <p className="l2-ok" style={{ marginTop: 8 }}>
                    Луно: Ты молодец! Благодаря тебе Аня в большей безопасности.
                  </p>
                )}
                {donePrivacy ? (
                  <button type="button" className="l5-btn-primary" style={{ marginTop: 12 }} onClick={onNext}>
                    Завершить
                  </button>
                ) : (
                  <p className="l2-err" style={{ marginBottom: 0 }}>
                    Подбери более безопасные настройки для всех пунктов.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </VkShell>
      {msg && <LunoMsg text={msg} />}
    </div>
  )
}

export function Level5Flow() {
  const { user, isTeacher, roleLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const state = await getLevelState(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < flow.length) setStep(state.step)
    })()
    return () => { cancelled = true }
  }, [user])

  const save = (n) => {
    setStep(n)
    if (user) setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => save(step + 1)
  const prev = () => save(Math.max(0, step - 1))
  const finish = () => {
    if (user) {
      completeLevelInDb(user.uid, LEVEL_ID)
      setLevelStep(user.uid, LEVEL_ID, 0)
    }
    navigate('/levels')
  }

  const item = flow[step]
  if (!item) return <div className="level-page">Загрузка…</div>

  const flowLen = flow.length
  const teacherExitPreview = () => navigate('/levels')

  return (
    <div className="level-page">
      <div className="level-container l2-wide l5-level">
        <div className="level-header">
          <button type="button" className="back-button" onClick={() => navigate('/levels')}>← Назад</button>
          <h1>{TITLE}</h1>
        </div>
        {step > 0 && (
          <div className="scenario-prev-wrap">
            <button type="button" className="scenario-prev-btn" onClick={prev}>
              ← Предыдущий шаг сценария
            </button>
          </div>
        )}
        {item.t === 'd' && (
          <div className="dialogue-section l5-dialogue-wrap">
            <div className="character-avatar">
              <div className="avatar-circle l2-avatar-photo"><CharacterAvatar name={item.c} /></div>
              <div className="character-name">{item.c}</div>
            </div>
            <div className="dialogue-bubble"><p>{item.x}</p></div>
            <div className="level-actions"><button type="button" className="next-button" onClick={next}>Далее →</button></div>
          </div>
        )}
        {item.t === 'game1' && <Game1 onNext={next} />}
        {item.t === 'game2' && <Game2 onNext={next} />}
        {item.t === 'game3' && <Game3 onNext={next} />}
        {item.t === 'final' && (
          <div className="l5-final">
            <div className="l5-final-mascot" aria-hidden>
              🐻
            </div>
            <h2>Так держать!</h2>
            <p>
              Ты справился со всеми троллями! Теперь ты знаешь, что делать, если над тобой издеваются в социальной сети.
            </p>
            <button type="button" className="l5-btn-primary" onClick={finish}>
              Завершить уровень 5
            </button>
          </div>
        )}
      </div>
      {!roleLoading && (
        <TeacherStepSkip
          isTeacher={isTeacher}
          isLastStep={step >= flowLen - 1}
          onSkipStep={next}
          onEndPreview={teacherExitPreview}
        />
      )}
    </div>
  )
}

