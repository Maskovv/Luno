import { useEffect, useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import './level3.css'

const PERM_LABELS = {
  camera: 'Камера',
  messages: 'Сообщения',
  files: 'Файлы',
  geo: 'Геопозиция',
}

const APPS = [
  { id: 'antivirus', icon: '🛡', label: 'Защитник', short: 'Антивирус' },
  { id: 'settings', icon: '⚙', label: 'Параметры', short: 'Настройки' },
  { id: 'files', icon: '📁', label: 'Загрузки', short: 'Файлы' },
  { id: 'update', icon: '🔄', label: 'Центр обновления', short: 'Обновления' },
]

function WinBtn({ children, className = '' }) {
  return <span className={`l3-pc-winbtn ${className}`.trim()} aria-hidden>{children}</span>
}

export function Level3SafePc({ onNext, lunoAvatarUrls }) {
  const [stage, setStage] = useState(0)
  const [perms, setPerms] = useState({
    camera: true,
    messages: true,
    files: true,
    geo: true,
  })
  const [fileSafe, setFileSafe] = useState({ game: false, hw: false })
  const [antivirusOn, setAntivirusOn] = useState(false)
  const [checkedFiles, setCheckedFiles] = useState({})
  const [appOpen, setAppOpen] = useState('antivirus')
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const donePerms = !perms.camera && !perms.messages && !perms.files && !perms.geo
  const doneFiles = fileSafe.game && fileSafe.hw
  const done = stage >= 5 && donePerms && doneFiles && antivirusOn

  const openApp = (id, minStage) => {
    setAppOpen(id)
    setStage((s) => Math.max(s, minStage))
  }

  const titleByApp = () => {
    const a = APPS.find((x) => x.id === appOpen)
    return a ? `${a.icon} ${a.label}` : 'Окно'
  }

  const progress =
    (antivirusOn ? 1 : 0) + (donePerms ? 1 : 0) + (doneFiles ? 1 : 0) + (stage >= 5 ? 1 : 0)

  return (
    <div className="l2-card l3-safepc-page">
      <div className="l3-safepc-lead">
        <div className="l3-safepc-lead-avatar" aria-hidden>
          <LunoPhoto urls={lunoAvatarUrls} className="l3-safepc-lead-img" alt="" />
        </div>
        <div>
          <h2 className="l2-title l3-safepc-lead-title">Игра 2: безопасный компьютер</h2>
          <p className="l2-sub l3-safepc-lead-sub">
            <RichText>
              Рабочий стол, окна и панель задач — как на настоящем ПК. Выполни все **четыре шага защиты**.
            </RichText>
          </p>
        </div>
      </div>

      <div className="l3-pc">
        <div className="l3-pc-wallpaper" aria-hidden />
        <div className="l3-pc-desktop">
          <div className="l3-pc-icons-col">
            {APPS.map((app) => {
              const ok =
                (app.id === 'antivirus' && stage >= 1 && antivirusOn) ||
                (app.id === 'settings' && donePerms) ||
                (app.id === 'files' && doneFiles) ||
                (app.id === 'update' && stage >= 5)
              return (
                <button
                  key={app.id}
                  type="button"
                  className={`l3-pc-icon-shortcut ${appOpen === app.id ? 'is-open' : ''} ${ok ? 'is-done' : ''}`}
                  onClick={() => openApp(app.id, app.id === 'antivirus' ? 1 : app.id === 'settings' ? 2 : app.id === 'files' ? 3 : 4)}
                >
                  <span className="l3-pc-icon-emoji" aria-hidden>{app.icon}</span>
                  <span className="l3-pc-icon-text">{app.short}</span>
                </button>
              )
            })}
          </div>

          <div className="l3-pc-window">
            <div className="l3-pc-titlebar">
              <span className="l3-pc-titlebar-icon" aria-hidden>
                {APPS.find((a) => a.id === appOpen)?.icon ?? '▢'}
              </span>
              <span className="l3-pc-titlebar-text">{titleByApp()}</span>
              <div className="l3-pc-titlebar-btns">
                <WinBtn>─</WinBtn>
                <WinBtn>□</WinBtn>
                <WinBtn className="is-close">✕</WinBtn>
              </div>
            </div>
            <div className="l3-pc-client">
              {appOpen === 'antivirus' && (
                <div className="l3-pc-panel">
                  <p className="l3-pc-panel-lead">Защита в реальном времени выключена.</p>
                  <div className="l3-pc-av-card">
                    <div className="l3-pc-av-row">
                      <span className="l3-pc-av-status">{antivirusOn ? 'Включено' : 'Отключено'}</span>
                      <button
                        type="button"
                        className={`l3-pc-toggle ${antivirusOn ? 'on' : ''}`}
                        onClick={() => setAntivirusOn(true)}
                        disabled={antivirusOn}
                      >
                        {antivirusOn ? 'Активно' : 'Включить'}
                      </button>
                    </div>
                    <p className="l3-pc-av-hint">Включи антивирус перед проверкой файлов.</p>
                  </div>
                </div>
              )}

              {appOpen === 'settings' && (
                <div className="l3-pc-panel">
                  <p className="l3-pc-panel-lead">Конфиденциальность → разрешения приложения</p>
                  <p className="l3-pc-panel-sub">Сними лишние галочки (все должны быть отключены).</p>
                  <ul className="l3-pc-perm-list">
                    {Object.keys(perms).map((k) => (
                      <li key={k} className="l3-pc-perm-row">
                        <label className="l3-pc-perm-label">
                          <input
                            type="checkbox"
                            checked={perms[k]}
                            onChange={(e) => setPerms({ ...perms, [k]: e.target.checked })}
                          />
                          <span>{PERM_LABELS[k] ?? k}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {appOpen === 'files' && (
                <div className="l3-pc-panel">
                  <p className="l3-pc-panel-lead">VirusTotal — проверка файлов</p>
                  <div className="l3-pc-table">
                    <div className="l3-pc-table-head">
                      <span>Имя</span>
                      <span>Действие</span>
                      <span>Статус</span>
                    </div>
                    {[
                      { id: 'game', name: 'game_free.exe', result: 'угроза обнаружена' },
                      { id: 'hw', name: 'homework.pdf', result: 'файл безопасен' },
                    ].map((f) => (
                      <div key={f.id} className="l3-pc-table-row">
                        <span className="l3-pc-fname">{f.name}</span>
                        <span>
                          <button
                            type="button"
                            className="l3-pc-mini-btn"
                            onClick={() => {
                              setCheckedFiles((prev) => ({ ...prev, [f.id]: true }))
                              if (f.id === 'game') setFileSafe((prev) => ({ ...prev, game: false }))
                              if (f.id === 'hw') setFileSafe((prev) => ({ ...prev, hw: true }))
                            }}
                          >
                            Проверить
                          </button>
                        </span>
                        <span className="l3-pc-fstatus">
                          {checkedFiles[f.id] ? f.result : '—'}
                          {f.id === 'game' && checkedFiles[f.id] && !fileSafe.game && (
                            <button
                              type="button"
                              className="l3-pc-mini-btn danger"
                              onClick={() => setFileSafe((prev) => ({ ...prev, game: true }))}
                            >
                              Удалить
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appOpen === 'update' && (
                <div className="l3-pc-panel">
                  <p className="l3-pc-panel-lead">Центр обновления Windows</p>
                  <div className="l3-pc-update-card">
                    <p className="l3-pc-update-title">Доступны обновления безопасности</p>
                    <p className="l3-pc-update-meta">2026-04 · накопительное обновление</p>
                    <button type="button" className="l3-pc-primary" onClick={() => setStage(5)}>
                      {stage >= 5 ? 'Система обновлена' : 'Установить и перезапустить'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="l3-pc-taskbar">
          <button type="button" className="l3-pc-start" aria-label="Пуск">
            <span className="l3-pc-start-win" />
          </button>
          <div className="l3-pc-task-search" aria-hidden>
            <span className="l3-pc-search-ico">🔍</span>
            Поиск
          </div>
          <div className="l3-pc-task-pinned">
            {APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                className={`l3-pc-task-ico ${appOpen === app.id ? 'active' : ''}`}
                title={app.label}
                onClick={() => openApp(app.id, app.id === 'antivirus' ? 1 : app.id === 'settings' ? 2 : app.id === 'files' ? 3 : 4)}
              >
                {app.icon}
              </button>
            ))}
          </div>
          <div className="l3-pc-task-tray" aria-hidden>
            <span className="l3-pc-tray-ico">📶</span>
            <span className="l3-pc-tray-ico">🔊</span>
            <span className="l3-pc-clock">{clock}</span>
          </div>
        </div>
      </div>

      {!done ? (
        <p className="l3-safepc-progress">Прогресс: {progress} / 4</p>
      ) : (
        <div className="l3-safepc-done">
          <p className="l3-safepc-done-text">
            <RichText>Все действия выполнены — компьютер в **безопасности**.</RichText>
          </p>
          <button type="button" className="l2-primary l3-safepc-continue" onClick={onNext}>
            Продолжить
          </button>
        </div>
      )}
    </div>
  )
}
