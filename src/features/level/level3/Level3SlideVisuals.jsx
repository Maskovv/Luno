/**
 * Псевдо-интерфейсы «как на настоящих сайтах/в ОС» для карусели уровня 3.
 */
import './level3Carousel.css'

export function SlideVisual({ variant }) {
  return (
    <div className={`l2-cc-visual l3cv l3cv--${variant}`} aria-hidden="true">
      {variant === 'l3intro' && <VisualIntro />}
      {variant === 'l3virus' && <VisualVirus />}
      {variant === 'l3spy' && <VisualSpy />}
      {variant === 'l3ransom' && <VisualRansom />}
      {variant === 'l3adware' && <VisualAdware />}
      {variant === 'l3trojan' && <VisualTrojan />}
      {variant === 'l3outro' && <VisualOutro />}
    </div>
  )
}

function VisualIntro() {
  return (
    <div className="l3cv-fill l3cv-intro">
      <div className="l3cv-intro-glow" />
      <div className="l3cv-win-fake">
        <div className="l3cv-titlebar">
          <span className="l3cv-dots" />
          <span>Безопасность Windows</span>
        </div>
        <div className="l3cv-def-body">
          <div className="l3cv-def-icon">🛡️</div>
          <p className="l3cv-def-head">Защита в реальном времени</p>
          <p className="l3cv-def-sub">Проверьте подозрительные файлы перед запуском</p>
          <button type="button" className="l3cv-btn-win">
            Быстрая проверка
          </button>
        </div>
      </div>
    </div>
  )
}

function VisualVirus() {
  return (
    <div className="l3cv-fill l3cv-virus">
      <div className="l3cv-win-fake">
        <div className="l3cv-titlebar">
          <span className="l3cv-dots" />
          <span>game_free.exe — Проводник</span>
        </div>
        <div className="l3cv-explorer">
          <div className="l3cv-exp-side">
            <div className="l3cv-exp-item">Быстрый доступ</div>
            <div className="l3cv-exp-item">Загрузки</div>
            <div className="l3cv-exp-item l3cv-exp-hi">Документы</div>
          </div>
          <div className="l3cv-exp-main">
            <div className="l3cv-toolbar">Упорядочить ▾  ·  ·  ·</div>
            <div className="l3cv-files">
              <div className="l3cv-file l3cv-file-bad">
                <span className="l3cv-ico">📄</span>
                <span>game_free.exe</span>
                <span className="l3cv-tag">не отвечает</span>
              </div>
              <div className="l3cv-file">
                <span className="l3cv-ico">📄</span>
                <span>readme.txt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="l3cv-toast l3cv-toast-bad">
        <strong>⚠ Защита Windows</strong>
        <span>Обнаружена угроза: Trojan:Win32/FakeGame. Файлы могут быть повреждены.</span>
      </div>
    </div>
  )
}

function VisualSpy() {
  return (
    <div className="l3cv-fill l3cv-spy">
      <div className="l3cv-phone">
        <div className="l3cv-phone-bar">9:41 · LTE · 🔋</div>
        <div className="l3cv-phone-h">Настройки · Приложения</div>
        <div className="l3cv-phone-sub">Фонарик HD — разрешения</div>
        <ul className="l3cv-perm-list">
          <li>
            <span>Камера</span>
            <span className="l3cv-toggle on">Вкл</span>
          </li>
          <li>
            <span>Сообщения</span>
            <span className="l3cv-toggle on">Вкл</span>
          </li>
          <li>
            <span>Файлы и медиа</span>
            <span className="l3cv-toggle on">Вкл</span>
          </li>
          <li>
            <span>Геолокация</span>
            <span className="l3cv-toggle on">Вкл</span>
          </li>
        </ul>
        <div className="l3cv-notif">
          <span className="l3cv-notif-dot" />
          Вход в аккаунт: новое устройство, Москва
        </div>
      </div>
    </div>
  )
}

function VisualRansom() {
  return (
    <div className="l3cv-fill l3cv-ransom">
      <div className="l3cv-lock-screen">
        <p className="l3cv-lock-title">ВАШИ ФАЙЛЫ ЗАШИФРОВАНЫ</p>
        <p className="l3cv-lock-sub">Все ваши документы, фото и базы данных зашифрованы с помощью AES-256.</p>
        <div className="l3cv-btc">
          <span>Оплатите</span>
          <strong>0.047 BTC</strong>
          <span>в течение 72 ч.</span>
        </div>
        <p className="l3cv-onion">Связь: x7k2…onion · ID: #A-9921</p>
        <button type="button" className="l3cv-btn-ransom">
          Расшифровать (Bitcoin)
        </button>
      </div>
    </div>
  )
}

function VisualAdware() {
  return (
    <div className="l3cv-fill l3cv-adware">
      <div className="l3cv-site">
        <div className="l3cv-site-topad">РЕКЛАМА · СКАЧАТЬ ДРАЙВЕР БЕСПЛАТНО</div>
        <header className="l3cv-site-hd">
          <span className="l3cv-logo">NEWS24</span>
          <nav className="l3cv-navfake">Политика · Спорт · Шоу</nav>
          <span className="l3cv-search">🔍</span>
        </header>
        <div className="l3cv-site-body">
          <aside className="l3cv-ban">
            <div className="l3cv-ban-inner">WIN PRIZE</div>
            <button type="button" className="l3cv-ban-btn">
              CLAIM NOW
            </button>
          </aside>
          <article className="l3cv-art">
            <h3 className="l3cv-art-title">Как ускорить ПК за 1 клик</h3>
            <p className="l3cv-art-lead">Спонсорский материал</p>
            <div className="l3cv-fake-btn-row">
              <button type="button" className="l3cv-dl">
                Скачать ускоритель
              </button>
              <button type="button" className="l3cv-dl">
                Обновить драйвер
              </button>
            </div>
          </article>
          <aside className="l3cv-ban">
            <div className="l3cv-ban-inner hot">HOT</div>
            <button type="button" className="l3cv-ban-btn">
              Смотреть
            </button>
          </aside>
        </div>
        <div className="l3cv-pop">
          <button type="button" className="l3cv-pop-x" aria-label="close">
            ×
          </button>
          <p>Ваш компьютер заражён!</p>
          <button type="button" className="l3cv-pop-ok">
            OK
          </button>
        </div>
        <div className="l3cv-pop l3cv-pop2">
          <span>Вы выиграли iPhone — нажмите «Далее»</span>
        </div>
      </div>
    </div>
  )
}

function VisualTrojan() {
  return (
    <div className="l3cv-fill l3cv-trojan">
      <div className="l3cv-soft">
        <div className="l3cv-soft-bar">
          <span className="l3cv-soft-dots" />
          <span>soft-load.net / minecraft-free</span>
        </div>
        <div className="l3cv-soft-hero">
          <div className="l3cv-soft-icon">⛏️</div>
          <h3 className="l3cv-soft-title">Minecraft для Windows</h3>
          <p className="l3cv-soft-ver">Версия 1.20 · 4,8 ★★★★★ (12 403 оценки)</p>
          <p className="l3cv-soft-safe">
            <span className="l3cv-pad">✓</span> Без вирусов (проверено сайтом)
          </p>
          <button type="button" className="l3cv-soft-dl">
            Бесплатное скачивание
          </button>
          <p className="l3cv-soft-note">Файл: Minecraft_бесплатно.exe · 48 МБ</p>
        </div>
      </div>
    </div>
  )
}

function VisualOutro() {
  return (
    <div className="l3cv-fill l3cv-outro">
      <div className="l3cv-outro-card">
        <div className="l3cv-outro-check">✓</div>
        <p className="l3cv-outro-txt">Типы угроз разобраны</p>
      </div>
    </div>
  )
}
