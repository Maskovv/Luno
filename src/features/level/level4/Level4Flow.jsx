import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import {
  completeLevel as completeLevelInDb,
  getLevelState,
  setLevelStep,
  unlockNextLevel,
} from '../../../shared/api/firestoreProgress'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { TeacherStepSkip } from '../../../shared/components/TeacherStepSkip'
import '../LevelPage.css'
import '../level2/level2.css'
import './level4.css'

const LEVEL_ID = '4'
const TITLE = 'Уровень 4. Финансовые мошенничества в киберсреде'

const flow = [
  { t: 'd', c: 'Ваня', x: 'Странно… кто это? (на экране: «Неизвестный номер»)' },
  { t: 'd', c: 'Луно', x: 'Стоп. Это мошенники. Настоящие сотрудники банка никогда не просят коды из СМС и не давят срочностью.' },
  { t: 'game1' },
  { t: 'd', c: 'Луно', x: 'Отлично. Теперь применим это в ситуациях и выберем безопасные действия.' },
  { t: 'game2' },
  { t: 'test' },
]

const game1Cases = [
  {
    title: 'СМС от банка',
    left: {
      kind: 'sms',
      from: '900',
      text: 'Здравствуйте, это ваш Банк, с вашего счёта пытаются снять 30000 рублей, для отмены операции переведите 1000 рублей по номеру телефона +79772779807',
    },
    right: {
      kind: 'sms',
      from: '900',
      text: 'Добрый день, клиент ДоброБанка, по вашей карте *4567 заблокирована подозрительная операция, для подтверждения операции позвоните на 8-800-800008',
    },
    real: 'right',
    explain: 'В левом сообщении орфографические ошибки и требование перевести деньги на сторонний номер. Банки не просят такого.',
  },
  {
    title: 'Звонок от банка',
    left: {
      kind: 'call',
      text: 'Ваш аккаунт в онлайн-банке взломан. Для защиты средств переведите деньги на резервный счёт, который я вам сейчас продиктую.',
    },
    right: {
      kind: 'call',
      text: 'Напоминаем, что срок действия вашей карты истекает через месяц. Новая карта уже выпущена и ждёт вас в отделении по адресу…',
    },
    real: 'right',
    explain: 'В первом разговоре требуют перевести деньги на «резервный счёт» и давят срочностью.',
  },
  {
    title: 'Сообщение от Госуслуг',
    left: {
      kind: 'notice',
      text: 'Госуслуги: Ваши паспортные данные скоро истекают. Зайдите в личный кабинет на gosuslugi.ru → раздел «Документы» → обновите данные.',
    },
    right: {
      kind: 'notice',
      text: 'ВНИМАНИЕ! Ваш аккаунт на Госуслугах заблокирован. Срочно перейдите по ссылке: gosuslugi-podtverzhdenie.ru и введите данные. Срок — 24 часа!',
    },
    real: 'left',
    explain: 'Во втором случае есть давление срочностью, угроза блокировки и подозрительная ссылка.',
  },
  {
    title: 'Восстановление пароля',
    left: {
      kind: 'email',
      from: 'support@vk.com',
      subject: 'Смена пароля',
      text: 'Добрый день, от вас поступил запрос на установку нового пароля, для подтверждения операции зайдите на vk.com/reset',
    },
    right: {
      kind: 'email',
      from: 'vk-security@gmail.com',
      subject: 'Смена пароля',
      text: 'Добрый день, от вас поступил запрос на установку нового пароля, для подтверждения операции зайдите на security.vk.special.com/reset',
    },
    real: 'left',
    explain: 'В правом сообщении подозрительный отправитель на gmail.com и ссылка явно не на vk.com.',
  },
  {
    title: 'Оплата на сайте',
    left: {
      kind: 'payment',
      addr: 'secu.pay/token=27251',
      secure: true,
    },
    right: {
      kind: 'payment',
      addr: 'sec.upay/token=118253',
      secure: false,
    },
    real: 'left',
    explain: 'Поддельный сайт может выглядеть похоже, но без защищённого соединения (замок отсутствует/опасный).',
  },
  {
    title: 'Сообщение от друга',
    left: {
      kind: 'chat',
      text: 'Ванька, привет, скинь 1000р пж, очень надо. К пятнице верну, номер мой знаешь',
    },
    right: {
      kind: 'chat',
      text: 'Привет, мне срочно нужны деньги, я влип. Переведи 5 000 руб. на карту мамы: 2202****5678. Потом всё объясню.',
    },
    real: 'left',
    explain: 'В правом сообщении срочность и просьба перевести деньги на стороннюю карту.',
  },
  {
    title: 'Диалог с ботом',
    left: {
      kind: 'chat',
      text: 'Пользователь: «Привет, напиши рецепт и ингредиенты для медовика». Бот: «Конечно! Рецепт медовика…»',
    },
    right: {
      kind: 'chat',
      text: 'Пользователь: «Помоги найти статью по истории». Бот: «Переходи скорее: tinyurl.com/greece-myths»',
    },
    real: 'left',
    explain: 'Во втором ответе даётся сокращённая подозрительная ссылка на сторонний ресурс.',
  },
  {
    title: 'Сообщение от курьерской службы',
    left: {
      kind: 'notice',
      text: 'СДЭК: ваша посылка заблокирована на таможне. Для оплаты пошлины перейдите по ссылке sdek-oplata.ru и введите данные карты.',
    },
    right: {
      kind: 'notice',
      text: 'СДЭК: посылка №12345 прибыла в пункт выдачи. Забрать можно в течение 7 дней.',
    },
    real: 'right',
    explain: 'В левом сообщении поддельная ссылка (не cdek.ru) и требование ввести данные карты.',
  },
]

const game2Cases = [
  {
    title: 'Инвестиции от банка',
    msg: 'Банк ВТБ: «Вложи 5 000 руб. — получи 15 000 через неделю! Гарантированная доходность 200 %. Акция 2 часа!»',
    options: [
      'А. Переведу деньги на указанный счёт.',
      'Б. Проверю в официальном приложении банка или на сайте vtb.ru.',
      'В. Напишу в чат «Спасибо, сейчас сделаю!»',
      'Г. Проигнорирую сообщение.',
    ],
    correct: ['Б. Проверю в официальном приложении банка или на сайте vtb.ru.'],
    hint: 'Подумай: банки не просят переводить деньги в чатах ради «доходности 200%».',
    explain: 'Настоящие банки не просят переводить деньги на личные счета в СМС. Проверяй только через официальные каналы.',
  },
  {
    title: 'Звонок от банка',
    msg: 'Звонящий просит назвать код из СМС, чтобы «отменить кредит».',
    options: [
      'А. Назвать код из СМС.',
      'Б. Назвать выдуманный код и посмотреть реакцию.',
      'В. Начать спорить.',
      'Г. Игнорировать звонок.',
      'Д. Сказать, что перезвонишь по официальному номеру банка, завершить разговор и сообщить взрослым.',
    ],
    correct: ['Д. Сказать, что перезвонишь по официальному номеру банка, завершить разговор и сообщить взрослым.'],
    hint: 'Никогда не сообщай коды из СМС во время звонка.',
    explain: 'Сотрудники банка не запрашивают СМС-коды по телефону. Перезванивай только по официальному номеру.',
  },
  {
    title: 'Звонок от госорганов',
    msg: '«Это инспектор МВД… назовите серию паспорта, СНИЛС и код из СМС».',
    options: [
      'А. Назвать все данные сразу.',
      'Б. Завершить разговор, перезвонить в МВД по официальному номеру и сообщить взрослым.',
      'В. Назвать код из СМС.',
      'Г. Назвать вымышленные данные.',
      'Д. Просто игнорировать.',
    ],
    correct: ['Б. Завершить разговор, перезвонить в МВД по официальному номеру и сообщить взрослым.'],
    hint: 'Госорганы не требуют по телефону СНИЛС и коды из СМС.',
    explain: 'Настоящие сотрудники госорганов не собирают такие данные по звонку. Всегда проверяй через официальный контакт.',
  },
  {
    title: 'Варианты заработка',
    msg: '«Оплата 5 000 за перевод денег. Нужен только номер карты».',
    options: [
      'А. Игнорировать сообщение.',
      'Б. Отправить номер карты.',
      'В. Если ответят «всё легально», отправить номер карты.',
      'Г. Не отправлять карту, сообщить родителям или учителю.',
    ],
    correct: ['Г. Не отправлять карту, сообщить родителям или учителю.'],
    hint: '«Лёгкий заработок за перевод денег» часто связан с дропперством.',
    explain: 'Так вовлекают в незаконные схемы перевода денег. Номер карты незнакомцам отправлять нельзя.',
  },
  {
    title: 'Розыгрыш',
    msg: '«Вы выиграли iPhone 15! Для получения введите данные карты для доставки».',
    options: [
      'А. Быстро перейти по ссылке и ввести карту.',
      'Б. Написать «сейчас всё сделаю».',
      'В. Проверить розыгрыш на официальном сайте, если нет — игнорировать. Сообщить родителям.',
      'Г. Разослать ссылку друзьям.',
    ],
    correct: ['В. Проверить розыгрыш на официальном сайте, если нет — игнорировать. Сообщить родителям.'],
    hint: 'Настоящие розыгрыши не требуют карту для «доставки приза».',
    explain: 'Проверяй только официальные страницы организаторов. Ввод данных карты на стороннем сайте опасен.',
  },
  {
    title: 'Сообщение от родственника про больницу',
    msg: '«Срочно переведи деньги на карту, потом всё объясню».',
    options: [
      'А. Сразу перевести деньги.',
      'Б. Позвонить родственнику по известному номеру или уточнить у близких, не переводить до проверки.',
      'В. Написать «сейчас переведу».',
      'Г. Попросить ещё реквизиты и перевести позже.',
    ],
    correct: ['Б. Позвонить родственнику по известному номеру или уточнить у близких, не переводить до проверки.'],
    hint: 'Сначала проверка личности, потом любые действия.',
    explain: 'Часто такие сообщения отправляют со взломанных аккаунтов. Нужно проверить информацию по надёжному каналу.',
  },
  {
    title: 'Сообщение от Admin_Game',
    msg: '«Выиграли легендарный меч. Перейдите по ссылке и введите данные аккаунта».',
    options: [
      'А. Быстро перейти и ввести данные.',
      'Б. Написать «Спасибо» и выполнить инструкции.',
      'В. Проверить на официальном сайте/в соцсетях игры. Сообщить родителям.',
      'Г. Поделиться ссылкой с друзьями.',
    ],
    correct: ['В. Проверить на официальном сайте/в соцсетях игры. Сообщить родителям.'],
    hint: 'Игровая администрация не просит логин/пароль на сторонних сайтах.',
    explain: 'Подарки начисляются через официальные механики игры, а не через внешние формы.',
  },
  {
    title: 'Продажа редких скинов за полцены',
    msg: '«Оплата вперёд на карту, потом передам скин».',
    options: [
      'А. Предложить сделку через официальную торговую площадку игры.',
      'Б. Перевести деньги сразу — очень выгодно.',
      'В. Согласиться и отправить предоплату.',
      'Г. Попросить у родителей деньги и перевести.',
    ],
    correct: ['А. Предложить сделку через официальную торговую площадку игры.'],
    hint: 'Безопасные сделки — только через официальные внутриигровые механики.',
    explain: 'Прямые переводы незнакомцам за «скины» часто заканчиваются потерей денег.',
  },
]

const fillBlocks = [
  {
    title: '1) Заполните пропуски',
    lines: [
      ['Мошенники сообщают о якобы', 'операции.'],
      ['Они создают чувство', ', чтобы человек не думал.'],
      ['Просят назвать', 'из СМС.'],
      ['Настоящие сотрудники не запрашивают такие', '.'],
    ],
    bank: ['выгоды', 'код', 'спокойствия', 'данные', 'пароль', 'подозрительной', 'срочности'],
    ans: ['подозрительной', 'срочности', 'код', 'данные'],
  },
  {
    title: '2) Заполните пропуски',
    lines: [
      ['Дропперство — это помощь', 'деньги, полученные незаконно.'],
      ['Обещают лёгкий', '.'],
      ['На деле это действия', '.'],
      ['Человек становится участником', 'схемы.'],
    ],
    bank: ['незаконными', 'хранить', 'заработок', 'безопасной', 'игрой', 'переводить', 'преступной'],
    ans: ['переводить', 'заработок', 'незаконными', 'преступной'],
  },
  {
    title: '3) Заполните пропуски',
    lines: [
      ['Дипфейки — это поддельные', 'или голосовые сообщения.'],
      ['Они могут имитировать', 'человека.'],
      ['Мошенники используют такие материалы, чтобы вызвать', '.'],
      ['Поэтому важно не доверять только увиденному и всегда', 'информацию.'],
    ],
    bank: ['голос', 'документы', 'сомнение', 'видео', 'жалость', 'игнорировать', 'сохранять', 'проверять', 'доверие', 'удалять'],
    ans: ['видео', 'голос', 'доверие', 'проверять'],
  },
  {
    title: '4) Заполните пропуски',
    lines: [
      ['Технология NFC позволяет оплачивать покупки с помощью', 'или карты без контакта.'],
      ['Однако мошенники могут попытаться получить', 'к устройству пользователя.'],
      ['Иногда они убеждают установить подозрительные', 'или выполнить инструкции.'],
      ['Поэтому важно не передавать своё устройство', 'людям.'],
    ],
    bank: ['кошелька', 'приложения', 'сообщения', 'вход', 'телефона', 'интернету', 'друзьям', 'доступ', 'незнакомым'],
    ans: ['телефона', 'доступ', 'приложения', 'незнакомым'],
  },
  {
    title: '5) Заполните пропуски',
    lines: [
      ['Мошеннические сайты часто предлагают слишком', 'цены, чтобы привлечь внимание.'],
      ['Они могут выглядеть как известные', 'или бренды.'],
      ['Пользователя торопят с оплатой, создавая ощущение', 'времени.'],
      ['После ввода данных или оплаты деньги могут быть', '.'],
    ],
    bank: ['нереальные', 'украдены', 'люди', 'ограниченного', 'низкие', 'высокие', 'проверенные', 'магазины', 'безопасного'],
    ans: ['низкие', 'магазины', 'ограниченного', 'украдены'],
  },
]

function arraysEq(a, b) {
  const A = new Set(a)
  const B = new Set(b)
  if (A.size !== B.size) return false
  for (const x of A) if (!B.has(x)) return false
  return true
}

function LunoModal({ title, text, onClose, isError = false }) {
  return (
    <div className="l2-modal-backdrop" role="presentation">
      <div className="l2-modal l4-modal">
        <div className="l4-modal-avatar">
          <CharacterAvatar name="Луно" />
        </div>
        <div className="l2-modal-title">{title}</div>
        <div className="l2-modal-body">{text}</div>
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
        <div className="l4-row"><strong>От кого:</strong> {data.from}</div>
        <div className="l4-msg">{data.text}</div>
      </div>
    )
  }
  if (data.kind === 'email') {
    return (
      <div className="l4-mail">
        <div className="l4-row"><strong>От кого:</strong> {data.from}</div>
        <div className="l4-row"><strong>Тема:</strong> {data.subject}</div>
        <div className="l4-msg">{data.text}</div>
      </div>
    )
  }
  if (data.kind === 'payment') {
    return (
      <div className="l4-pay">
        <div className="l4-pay-bar">{data.secure ? '🔒' : '⚠'} {data.addr}</div>
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
  const cur = game1Cases[idx]

  const submit = () => {
    if (!pick) return
    const ok = pick === cur.real
    setModal({
      ok,
      text: ok ? `Верно! Молодец! ${cur.explain}` : `Неверно :( ${cur.explain}`,
    })
  }

  const closeModal = () => {
    setModal(null)
    setPick('')
    if (idx === game1Cases.length - 1) onNext()
    else setIdx((i) => i + 1)
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Игра 1: Определи настоящее сообщение</h2>
      <p className="l2-sub"><strong>{cur.title}</strong></p>
      <div className="l4-pair">
        <button type="button" className={`l4-case ${pick === 'left' ? 'active' : ''}`} onClick={() => setPick('left')}>
          <CasePreview data={cur.left} />
        </button>
        <button type="button" className={`l4-case ${pick === 'right' ? 'active' : ''}`} onClick={() => setPick('right')}>
          <CasePreview data={cur.right} />
        </button>
      </div>
      <div className="l4-actions">
        <button type="button" className={`l4-choose ${pick === 'left' ? 'active' : ''}`} onClick={() => setPick('left')}>Настоящий</button>
        <button type="button" className={`l4-choose ${pick === 'right' ? 'active' : ''}`} onClick={() => setPick('right')}>Настоящий</button>
      </div>
      <button type="button" className="l2-primary" onClick={submit}>Проверить</button>
      <p className="l2-progress">{idx + 1} / {game1Cases.length}</p>
      {modal && (
        <LunoModal
          title={modal.ok ? 'Верно!' : 'Неверно :('}
          text={modal.text}
          onClose={closeModal}
          isError={!modal.ok}
        />
      )}
    </div>
  )
}

function Game2({ onNext }) {
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState([])
  const [err, setErr] = useState('')
  const [okModal, setOkModal] = useState(false)
  const cur = game2Cases[idx]
  const isSingle = cur.correct.length === 1
  const toggle = (o) => setPick((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))

  const submit = () => {
    if (!arraysEq(pick, cur.correct)) {
      setErr(`Попробуй ещё раз. ${cur.hint}`)
      return
    }
    setErr('')
    setOkModal(true)
  }

  const nextCase = () => {
    setOkModal(false)
    setPick([])
    if (idx === game2Cases.length - 1) onNext()
    else setIdx((i) => i + 1)
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Игра 2: Выбери безопасное действие</h2>
      <p className="l2-sub"><strong>{cur.title}.</strong> {cur.msg}</p>
      <div className="l2-opts">
        {cur.options.map((o) => (
          <label key={o} className="l2-opt">
            <input
              type={isSingle ? 'radio' : 'checkbox'}
              name={`g2_${idx}`}
              checked={pick.includes(o)}
              onChange={() => (isSingle ? setPick([o]) : toggle(o))}
            /> {o}
          </label>
        ))}
      </div>
      {err && <p className="l2-err">{err}</p>}
      <button type="button" className="l2-primary" onClick={submit}>Проверить</button>
      <p className="l2-progress">{idx + 1} / {game2Cases.length}</p>
      {okModal && (
        <LunoModal
          title="Верно! Молодец!"
          text={cur.explain}
          onClose={nextCase}
        />
      )}
    </div>
  )
}

function Test({ onComplete }) {
  const [fills, setFills] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const randomized = useMemo(
    () => fillBlocks.map((b) => ({ ...b, bank: [...b.bank].sort(() => Math.random() - 0.5) })),
    [],
  )
  const ok = fillBlocks.every((b, bi) => b.ans.every((x, i) => (fills[`${bi}_${i}`] || '') === x))
  const allOk = submitted && ok
  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Тест</h2>
      {fillBlocks.map((b, bi) => (
        <div key={bi} className="l2-q">
          <p className="l2-q-title">{b.title}</p>
          <p className="l2-sub">Слова: {randomized[bi].bank.join(', ')}</p>
          {b.lines.map((ln, i) => (
            <p key={i}>
              {ln[0]}{' '}
              <select value={fills[`${bi}_${i}`] || ''} onChange={(e)=>setFills({...fills, [`${bi}_${i}`]: e.target.value})}>
                <option value="">— выберите —</option>
                {randomized[bi].bank.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>{' '}
              {ln[1]}
            </p>
          ))}
        </div>
      ))}
      {!allOk && <button type="button" className="l2-primary" onClick={() => setSubmitted(true)}>Проверить</button>}
      {submitted && !allOk && <p className="l2-err">Есть ошибки. Исправь и проверь снова.</p>}
      {allOk && <div className="l2-win"><p>Отлично! Уровень 4 пройден.</p><button type="button" className="l2-primary" onClick={onComplete}>Завершить уровень</button></div>}
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
      const state = await getLevelState(user.uid, LEVEL_ID)
      if (cancelled) return
      if (state?.completed) {
        setStep(0)
        setLevelStep(user.uid, LEVEL_ID, 0)
        return
      }
      if (state?.step != null && state.step < flow.length) setStep(state.step)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const save = (n) => {
    setStep(n)
    if (user) setLevelStep(user.uid, LEVEL_ID, n)
  }
  const next = () => save(step + 1)
  const prev = () => save(Math.max(0, step - 1))

  const finish = () => {
    if (user) {
      unlockNextLevel(user.uid, 5)
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
      <div className="level-container l2-wide">
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
          <div className="dialogue-section">
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
        {item.t === 'test' && <Test onComplete={finish} />}
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

