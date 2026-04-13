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
import { GameSplashScreen } from '../../../shared/components/GameSplashScreen'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import '../LevelPage.css'
import '../level2/level2.css'
import './level4.css'

const LEVEL_ID = '4'
const TITLE = 'Уровень 4. Финансовые мошенничества в киберсреде'

const flow = [
  { t: 'd', c: 'Ваня', x: ['Вдруг у Вани звонит телефон.', 'На экране: «Неизвестный номер».', '— Странно… кто это?'] },
  {
    t: 'd',
    c: 'Мошенник',
    x: [
      'Мошенник:',
      '— Здравствуйте. Это служба безопасности банка.',
      'На ваше имя сейчас пытаются оформить кредит.',
    ],
  },
  { t: 'd', c: 'Ваня', x: '— Что?.. Я ничего не оформлял!' },
  {
    t: 'd',
    c: 'Мошенник',
    x: ['— Тогда нужно срочно остановить операцию.', 'Сейчас вам придёт СМС-код.', 'Назовите его, чтобы отменить кредит.'],
  },
  { t: 'd', c: 'Ваня', x: '📩 «Код подтверждения: 482913. Никому не сообщайте этот код»' },
  { t: 'd', c: 'Маша', x: ['— Ваня, быстрее скажи код!', 'Если это правда, вдруг на тебя оформят кредит!'] },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— Стоп.',
      'Это мошенники.',
    ],
  },
  { t: 'd', c: 'Ваня', x: '— Но… они сказали, что из банка…' },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— Настоящие сотрудники банка:',
      'никогда не просят называть коды из СМС',
      'не действуют через давление и срочность',
      '— Обратите внимание:',
      'вас пытаются напугать («оформляют кредит»)',
      'требуют срочное действие',
      'просят передать секретный код',
    ],
  },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— В сообщении прямо написано:',
      '«Никому не сообщайте код».',
      '— Если передать этот код —',
      'вы сами дадите доступ к своим данным или деньгам.',
    ],
  },
  { t: 'd', c: 'Маша', x: '— То есть… если бы он сказал код…' },
  { t: 'd', c: 'Луно', x: ['— Мошенники могли бы:', 'получить доступ к аккаунту (например, госуслуг)', 'подтвердить операцию', 'украсть деньги'] },
  { t: 'd', c: 'Ваня', x: '— Я чуть не повёлся…' },
  {
    t: 'splash',
    title: 'ИГРА 1',
    paragraphs: [
      'В цифровом мире важно защищать не только свои данные, но и деньги.',
      'Мошенники часто пытаются обмануть людей, играя на эмоциях: страхе, спешке или желании получить что-то выгодное.',
    ],
    closing: 'Задание: определите настоящее и мошенническое сообщение.',
    buttonText: 'Начать игру 1',
  },
  { t: 'game1' },
  {
    t: 'd',
    c: 'Луно',
    x: [
      '— Отлично. Теперь применим это в ситуациях и выберем безопасные действия.',
      '— Если ответ неверный — просто попробуй ещё раз.',
    ],
  },
  {
    t: 'splash',
    title: 'ИГРА 2',
    paragraphs: ['Прочитайте каждое сообщение и выберите правильный(ые) вариант(ы) ответа.'],
    buttonText: 'Начать игру 2',
  },
  { t: 'game2' },
  {
    t: 'splash',
    title: 'ТЕСТ',
    paragraphs: ['Заполните пропуски, выбрав правильные слова из списка.'],
    buttonText: 'Перейти к тесту',
  },
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
    wrongExplain:
      '-В левом сообщении существуют орфографические ошибки, применяется некорректный стиль, который банки никогда не используют («ваш Банк»), присутствуют требования перевести деньги на сторонние номера для «отмены операции», банки используют только официальные реквизиты (+79772779807).',
    rightExplain:
      '- Часто мошенники представляются сотрудниками банка. Они могут говорить, что на вас пытаются оформить кредит или происходит подозрительная операция, и просят срочно назвать код из СМС или просят перевести деньги. Важно запомнить: настоящие сотрудники банка никогда не просят переводить деньги, сообщать коды, пароли или данные карты.',
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
    wrongExplain:
      '-В первом разговоре присутствует требование перевести деньги на «резервные счета» для защиты. Используют давление и срочность: вас заставляют действовать без раздумий, не давая времени на проверку информации.',
    rightExplain:
      '— Ещё один современный способ обмана — это дипфейки.\n— Дипфейк — это поддельное видео или голос, созданный с помощью технологий, которые могут копировать внешность и речь человека.\n— Это значит, что мошенники могут сделать видео или аудио, где кажется, что говорит знакомый человек, блогер, представитель банка или даже родственник.\n— Например, вам может прийти голосовое сообщение якобы от друга: «Срочно переведи деньги, потом объясню».\nИ голос будет звучать очень похоже на настоящего человека.',
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
    wrongExplain:
      '- Во втором случае имеется эффект срочности и давления, также имеется подозрительная ссылка, которую мошенники сделали похожей на оригинальную gosuslugi-podtverzhdenie.ru. А также признаками мошенников являются - угроза блокировки аккаунта и неестественные формулировки в тексте.',
    rightExplain:
      '- Обратите внимание! Мошенники часто пытаются украсть ваши данные( или доступ) из госуслуг.',
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
    wrongExplain:
      '-В правом сообщении подозрительный отправитель с почтовым адресом на gmail.com - бесплатном и доступном для всех. Также предлагаемая ссылка ведёт явно не на vk.com.',
    rightExplain: 'Подозрительный отправитель с адресом на gmail.com и ссылка ведёт не на vk.com.',
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
    wrongExplain:
      '- Тут мошенники поступили хитрее! Они сделали точную копию и даже название подобрали. Но вот сертификат безопасности им так просто не получить! Поэтому замочек есть только у правильного сайта. Может быть также такой небезопасный значок.',
    rightExplain:
      '— Очень часто мошенники притворяются известными брендами или магазинами. Они создают поддельные сайты, которые выглядят как настоящие, предлагают большие скидки и заставляют быстро оплатить товар. После оплаты деньги уходят, а товар не приходит. Такие сайты можно распознать по слишком низким ценам, странным адресам, отсутствию отзывов или ошибкам в тексте. Часто присутствует значок, оповещающий, что сайт небезопасный. Обращай на это внимание!',
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
    wrongExplain:
      '- В правом сообщении мошенники используют срочность, чтобы у вас было меньше времени подумать, а также просят перевести деньги на сторонние карты.',
    rightExplain:
      '— Как вы поняли, иногда сообщения могут приходить даже от «друзей. В таких случаях важно не спешить и проверить информацию — например, позвонить человеку. Часто такие сообщения отправляют мошенники, взломавшие аккаунт.',
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
    wrongExplain:
      '- В левом запросе указана небезопасная ссылка, при нажатии на которую можно запустить вирусы, или может произойти утечка данных. Все ссылки должны быть безопасными и с официальных сайтов.',
    rightExplain:
      '— Ещё одна распространённая схема — мошеннические боты. Они могут писать в мессенджерах или социальных сетях, представляться службой поддержки, магазином или даже знакомым. Такие боты выглядят очень убедительно, быстро отвечают и могут вести диалог, как настоящий человек. Иногда это учебные боты. Их задача — заставить вас перейти по ссылке, сообщить данные или что-то оплатить.',
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
    wrongExplain:
      '- Левое сообщение подозрительную ссылка (sdek-oplata.ru вместо официального cdek.ru), а также требования ввести данные карты на стороннем сайте.',
    rightExplain:
      '- Мошенник могут выдавать себя за различные бренды, курьерские доставки, почту и тд. Всегда будьте внимательны и перепроверяйте информацию!',
  },
]

const game2Cases = [
  {
    title: 'Инвестиции от банка',
    msg:
      '«Банк ВТБ: эксклюзивное предложение для вас! Вложи 5 000 руб. — получи 15 000 руб. через неделю! Гарантированная доходность 200 %. Переведи деньги на счёт 4081****1234 и отправь чек в этот чат. Акция действует 2 часа!»',
    options: [
      'А. Переведу деньги на указанный счёт.',
      'Б. Проверю в официальном приложении банка или на сайте vtb.ru.',
      'В. Напишу в чат «Спасибо, сейчас сделаю!»',
      'Г. Проигнорирую сообщение.',
    ],
    correct: ['Б. Проверю в официальном приложении банка или на сайте vtb.ru.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Настоящие банки не рассылают такие предложения в виде СМС с просьбой перевести деньги на личный счёт. Все инвестиционные продукты оформляются через официальное приложение или сайт банка.',
  },
  {
    title: 'Звонок от банка',
    msg:
      'Звонивший: «Здравствуйте, это служба безопасности Сбербанка. Мы заметили подозрительную активность: на ваше имя взят кредит в размере 300 000 руб. Сейчас вам придёт СМС-код, назовите его, и мы заблокируем заявку».',
    options: [
      'А. Назвать код из СМС.',
      'Б. Назвать выдуманный код и посмотреть реакцию.',
      'В. Начать спорить.',
      'Г. Игнорировать звонок.',
      'Д. Сказать, что перезвонишь по официальному номеру банка, завершить разговор и сообщить взрослым.',
    ],
    correct: ['Д. Сказать, что перезвонишь по официальному номеру банка, завершить разговор и сообщить взрослым.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Настоящие сотрудники банка никогда не просят назвать код из СМС по телефону. Если есть сомнения — всегда перепроверяйте через официальные каналы: найдите официальный номер банка и позвоните туда. Также важно сообщить родителям или взрослым.',
  },
  {
    title: 'Звонок от госорганов',
    msg:
      '«Здравствуйте, это старший инспектор отдела финансового мониторинга МВД России. Чтобы снять с вас подозрения, назовите серию и номер паспорта, СНИЛС и код из СМС».',
    options: [
      'А. Назвать все данные сразу.',
      'Б. Завершить разговор, перезвонить в МВД по официальному номеру и сообщить взрослым.',
      'В. Назвать код из СМС.',
      'Г. Назвать вымышленные данные.',
      'Д. Просто игнорировать.',
    ],
    correct: ['Б. Завершить разговор, перезвонить в МВД по официальному номеру и сообщить взрослым.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Настоящие сотрудники госорганов никогда не просят по телефону назвать коды из СМС, паспортные данные или СНИЛС. Если есть сомнения — всегда перепроверяйте через официальный сайт организации и сообщайте родителям или взрослым.',
  },
  {
    title: 'Варианты заработка',
    msg:
      '«Ваня, хочешь заработать деньги? Всё легально. Нам срочно требуются помощники для перевода денег! Оплата 5 000 руб. за операцию. Нужен только номер карты».',
    options: [
      'А. Игнорировать сообщение.',
      'Б. Отправить номер карты.',
      'В. Если ответят «всё легально», отправить номер карты.',
      'Г. Не отправлять карту, сообщить родителям или учителю.',
    ],
    correct: ['Г. Не отправлять карту, сообщить родителям или учителю.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Предложения «заработать, переводя деньги» почти всегда связаны с отмыванием денег или мошенничеством. Никогда не отправляйте номер карты незнакомцам.',
  },
  {
    title: 'Розыгрыш',
    msg:
      '«Ваня, поздравляем! Вы выиграли iPhone 15! Для получения приза перейдите по ссылке: iphone-rozygrysh.ru, введите данные карты для оплаты доставки (возврат 100 %). Ссылка активна 1 час!»',
    options: [
      'А. Быстро перейти по ссылке и ввести карту.',
      'Б. Написать «сейчас всё сделаю».',
      'В. Проверить розыгрыш на официальном сайте, если нет — игнорировать. Сообщить родителям.',
      'Г. Разослать ссылку друзьям.',
    ],
    correct: ['В. Проверить розыгрыш на официальном сайте, если нет — игнорировать. Сообщить родителям.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Настоящие розыгрыши не требуют данных карты для «оплаты доставки». Призёры получают инструкции от организаторов напрямую, а информация о победителях публикуется официально.',
  },
  {
    title: 'Сообщение от родственника про больницу',
    msg:
      '«Привет, это тётя Галя. Я в больнице, срочно нужны деньги на операцию. Переведи, пожалуйста, 10 000 руб. на карту 2200****5678. Потом всё объясню».',
    options: [
      'А. Сразу перевести деньги.',
      'Б. Позвонить родственнику по известному номеру или уточнить у близких, не переводить до проверки.',
      'В. Написать «сейчас переведу».',
      'Г. Попросить ещё реквизиты и перевести позже.',
    ],
    correct: ['Б. Позвонить родственнику по известному номеру или уточнить у близких, не переводить до проверки.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Если сообщение от родственника содержит просьбу о деньгах и звучит тревожно, всегда перепроверяйте информацию. Позвоните человеку напрямую по известному номеру.',
  },
  {
    title: 'Сообщение от Admin_Game',
    msg:
      '«Поздравляем! Вы выиграли легендарный меч! Для получения перейдите по ссылке: game-gift.ru и введите данные вашей учётной записи. Ссылка активна 1 час!»',
    options: [
      'А. Быстро перейти и ввести данные.',
      'Б. Написать «Спасибо» и выполнить инструкции.',
      'В. Проверить на официальном сайте/в соцсетях игры. Сообщить родителям.',
      'Г. Поделиться ссылкой с друзьями.',
    ],
    correct: ['В. Проверить на официальном сайте/в соцсетях игры. Сообщить родителям.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Администрация игры никогда не просит вводить данные аккаунта на сторонних сайтах. Подарки начисляются автоматически внутри игры.',
  },
  {
    title: 'Продажа редких скинов за полцены',
    msg:
      '«Продаю легендарный меч за 50 % от цены! Обычно стоит 10 000 руб., а тебе отдам за 5000 руб.! Но оплата вперёд — переведи на карту, я сразу пришлю скин в игре».',
    options: [
      'А. Предложить сделку через официальную торговую площадку игры.',
      'Б. Перевести деньги сразу — очень выгодно.',
      'В. Согласиться и отправить предоплату.',
      'Г. Попросить у родителей деньги и перевести.',
    ],
    correct: ['А. Предложить сделку через официальную торговую площадку игры.'],
    wrongExplain: 'Попробуй ещё раз.',
    explain:
      'Безопасные сделки в играх проводятся только через официальные механизмы (торговая площадка, внутриигровой обмен). Никогда не переводите деньги незнакомым игрокам напрямую.',
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

function DialogueLines({ text }) {
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </>
    )
  }
  return <p>{text}</p>
}

function LunoModal({ title, text, onClose, isError = false }) {
  const lines = String(text || '').split('\n').filter(Boolean)
  return (
    <div className="l2-modal-backdrop" role="presentation">
      <div className="l2-modal l4-modal">
        <div className="l4-modal-avatar">
          <CharacterAvatar name="Луно" />
        </div>
        <div className="l2-modal-title">{title}</div>
        <div className="l2-modal-body">
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
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
  const [done, setDone] = useState(false)
  const cur = game1Cases[idx]

  const submit = () => {
    if (!pick) return
    const ok = pick === cur.real
    setModal({
      ok,
      text: ok ? cur.rightExplain : cur.wrongExplain,
    })
  }

  const closeModal = () => {
    const wasOk = modal?.ok
    setModal(null)
    if (!wasOk) return
    setPick('')
    if (idx === game1Cases.length - 1) {
      setDone(true)
      return
    }
    setIdx((i) => i + 1)
  }

  if (done) {
    return (
      <LunoVictoryScreen title="Отлично!" onContinue={onNext} continueLabel="Вперёд">
        <p>Ты завершил игру 1 и успешно разобрал базовые схемы финансового мошенничества.</p>
      </LunoVictoryScreen>
    )
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
          title={modal.ok ? 'Верно! Молодец!' : 'Неверно :('}
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
  const [modal, setModal] = useState(null)
  const [done, setDone] = useState(false)
  const cur = game2Cases[idx]
  const isSingle = cur.correct.length === 1
  const toggle = (o) => setPick((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))

  const submit = () => {
    if (!arraysEq(pick, cur.correct)) {
      setModal({ ok: false, text: cur.wrongExplain || 'Попробуй ещё раз.' })
      return
    }
    setModal({ ok: true, text: cur.explain })
  }

  const nextCase = () => {
    const wasOk = modal?.ok
    setModal(null)
    if (!wasOk) return
    setPick([])
    if (idx === game2Cases.length - 1) {
      setDone(true)
      return
    }
    setIdx((i) => i + 1)
  }

  if (done) {
    return (
      <LunoVictoryScreen title="Молодец!" onContinue={onNext} continueLabel="Вперёд">
        <p>Игра 2 пройдена. Ты потренировался выбирать безопасные действия в разных ситуациях.</p>
      </LunoVictoryScreen>
    )
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
      <button type="button" className="l2-primary" onClick={submit}>Проверить</button>
      <p className="l2-progress">{idx + 1} / {game2Cases.length}</p>
      {modal && (
        <LunoModal
          title={modal.ok ? 'Верно! Молодец!' : 'Неверно :('}
          text={modal.text}
          onClose={nextCase}
          isError={!modal.ok}
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
      <LunoVictoryScreen title="Уровень 4 пройден!" onContinue={onComplete} continueLabel="К выбору уровней">
        <p>Отлично! Ты разобрал схемы финансового мошенничества и закрепил правила безопасного поведения.</p>
      </LunoVictoryScreen>
    )
  }

  return (
    <div className="l2-card l4-card">
      <h2 className="l2-title">Тест</h2>
      <p className="l2-progress">Шаг {step + 1} из {fillBlocks.length}</p>
      <div className="l2-q">
        <p className="l2-q-title">{fillBlocks[step].title}</p>
        <p className="l2-sub">Слова: {randomized[step].bank.join(', ')}</p>
        {fillBlocks[step].lines.map((ln, i) => (
          <p key={i}>
            {ln[0]}{' '}
            <select
              value={fills[`${step}_${i}`] || ''}
              onChange={(e) => {
                setStepError('')
                setFills({ ...fills, [`${step}_${i}`]: e.target.value })
              }}
            >
              <option value="">— выберите —</option>
              {randomized[step].bank.map((w) => <option key={w} value={w}>{w}</option>)}
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
          <button type="button" className="l2-primary" onClick={() => setSubmitted(true)}>Проверить</button>
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
            <div className="dialogue-bubble"><DialogueLines text={item.x} /></div>
            <div className="level-actions"><button type="button" className="next-button" onClick={next}>Далее →</button></div>
          </div>
        )}
        {item.t === 'splash' && (
          <GameSplashScreen
            title={item.title}
            paragraphs={item.paragraphs}
            closing={item.closing}
            buttonText={item.buttonText}
            onContinue={next}
          />
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

