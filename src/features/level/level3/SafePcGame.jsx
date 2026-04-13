import { useState, useCallback } from 'react'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import './level3.css'

const PERM_KEYS = [
  { id: 'camera', label: 'К камере' },
  { id: 'messages', label: 'К сообщениям' },
  { id: 'files', label: 'К файлам' },
  { id: 'geo', label: 'К геолокации' },
]

export function SafePcGame({ onComplete }) {
  const [open, setOpen] = useState(null)
  const [done, setDone] = useState({ av: false, perms: false, files: false, update: false })
  const [showWin, setShowWin] = useState(false)

  const [av, setAv] = useState({ step: 'off' })
  const [perms, setPerms] = useState({ camera: true, messages: true, files: true, geo: true })
  const [files, setFiles] = useState({ exe: null, pdf: null })
  const [upd, setUpd] = useState('idle')

  const permsOk = PERM_KEYS.every((k) => !perms[k.id])
  const filesOk = files.exe === 'bad' && files.pdf === 'ok'

  const close = () => setOpen(null)

  const runScan = useCallback(() => {
    setAv({ step: 'scanning' })
    setTimeout(() => setAv({ step: 'threat' }), 1800)
  }, [])

  const eliminate = () => {
    setAv({ step: 'done' })
    setDone((d) => ({ ...d, av: true }))
  }

  const applyPerms = () => {
    if (!permsOk) return
    setDone((d) => ({ ...d, perms: true }))
    close()
  }

  const checkFile = (id) => {
    if (id === 'exe') setFiles((f) => ({ ...f, exe: 'bad' }))
    if (id === 'pdf') setFiles((f) => ({ ...f, pdf: 'ok' }))
  }

  const startUpdate = () => {
    setUpd('progress')
    setTimeout(() => {
      setUpd('done')
      setDone((d) => ({ ...d, update: true }))
    }, 2200)
  }

  const saveFilesStep = () => {
    if (!filesOk) return
    setDone((d) => ({ ...d, files: true }))
    close()
  }

  const allDone = done.av && done.perms && done.files && done.update

  const openAv = () => {
    setOpen('av')
    if (done.av) setAv({ step: 'done' })
    else if (av.step === 'off' && !done.av) setAv({ step: 'off' })
  }

  return (
    <div className="l2-card l3-cyber l3-safe-root">
      <h2 className="l2-title">Игра 2: Безопасный компьютер</h2>
      <p className="l2-sub">
        Это учебный «рабочий стол»: нажимай на крупные значки по порядку — антивирус, настройки, проверка файлов в
        окне в духе VirusTotal, затем обновление системы.
      </p>

      <div className="l3-desk-scene">
        <div className="l3-desk-wall" aria-hidden />
        <div className="l3-desk-monitor">
          <div className="l3-desk-screen">
            <div className="l3-desk-taskbar">
              <span>Учебный ПК</span>
              <span className="l3-desk-note">Подозрительное приложение отключено</span>
            </div>
            <div className="l3-desk-icons">
              <button type="button" className="l3-desk-ico" onClick={openAv}>
                <span className="l3-desk-ico-big">🛡️</span>
                <span>Антивирус {done.av ? '✓' : ''}</span>
              </button>
              <button type="button" className="l3-desk-ico" disabled={!done.av} onClick={() => setOpen('perms')}>
                <span className="l3-desk-ico-big">⚙️</span>
                <span>Настройки {done.perms ? '✓' : ''}</span>
              </button>
              <button type="button" className="l3-desk-ico" disabled={!done.perms} onClick={() => setOpen('vt')}>
                <span className="l3-desk-ico-big">🌐</span>
                <span>Браузер · проверка файлов {done.files ? '✓' : ''}</span>
              </button>
              <button type="button" className="l3-desk-ico" disabled={!done.files} onClick={() => setOpen('upd')}>
                <span className="l3-desk-ico-big">🔄</span>
                <span>Обновление {done.update ? '✓' : ''}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="l2-progress">
        Шаги: антивирус {done.av ? '✓' : '…'} · доступы {done.perms ? '✓' : '…'} · файлы {done.files ? '✓' : '…'} ·
        обновление {done.update ? '✓' : '…'}
      </p>

      {open === 'av' && (
        <div className="l3-overlay" role="presentation">
          <div className="l3-overlay-inner l3-av-panel" onClick={(e) => e.stopPropagation()}>
            <div className="l3-av-head">АНТИВИРУС</div>
            {av.step === 'off' && (
              <>
                <p className="l3-av-warn">Антивирус выключен</p>
                <div className="l3-av-shield-wrap">
                  <div className="l3-av-shield">🛡️</div>
                </div>
                <button type="button" className="l3-av-bigbtn" onClick={() => setAv({ step: 'on' })}>
                  Включить защиту
                </button>
              </>
            )}
            {av.step === 'on' && (
              <>
                <p>Хотите запустить проверку?</p>
                <div className="l3-av-shield-wrap">
                  <div className="l3-av-shield l3-av-shield-mesh">🛡️</div>
                </div>
                <button type="button" className="l3-av-bigbtn" onClick={runScan}>
                  ПРОВЕСТИ ПРОВЕРКУ
                </button>
                <p className="l3-luno-inline dark">
                  <CharacterAvatar name="Луно" /> <span>Теперь проверим устройство.</span>
                </p>
              </>
            )}
            {av.step === 'scanning' && (
              <div className="l3-scan">
                <p>Проверка…</p>
                <div className="l3-scan-bar">
                  <div className="l3-scan-fill" />
                </div>
              </div>
            )}
            {av.step === 'threat' && (
              <>
                <p className="l3-av-alert">Найдена угроза!</p>
                <div className="l3-av-shield-wrap l3-av-danger">
                  <div className="l3-av-shield">⚠️</div>
                </div>
                <p className="l3-luno-inline dark">
                  <CharacterAvatar name="Луно" />{' '}
                  <span>
                    Устройство заражено троянцем-стилером. Устраним угрозу — потом расскажу подробнее о таких программах.
                  </span>
                </p>
                <button type="button" className="l3-av-bigbtn danger" onClick={eliminate}>
                  УСТРАНИТЬ УГРОЗУ
                </button>
              </>
            )}
            {(av.step === 'done' || done.av) && (
              <>
                <p className="l3-av-ok">Защита активна, угроза устранена.</p>
                <p className="l3-luno-inline dark">
                  <strong>Луно:</strong> Отлично. Антивирус помогает обнаруживать угрозы.
                </p>
                <button type="button" className="l2-primary" onClick={close}>
                  На рабочий стол
                </button>
              </>
            )}
            <button type="button" className="l3-overlay-close" onClick={close}>
              Закрыть окно
            </button>
          </div>
        </div>
      )}

      {open === 'perms' && (
        <div className="l3-overlay">
          <div className="l3-overlay-inner l3-perm-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Доступы приложения</h3>
            <p className="l2-sub dark">
              У подозрительного приложения включён полный доступ. Отключи лишнее для камеры, сообщений, файлов и
              геолокации.
            </p>
            <div className="l3-perm-table">
              {PERM_KEYS.map((k) => (
                <div key={k.id} className="l3-perm-row">
                  <span>{k.label}</span>
                  <button
                    type="button"
                    className={`l3-toggle ${perms[k.id] ? 'on' : 'off'}`}
                    onClick={() => setPerms((p) => ({ ...p, [k.id]: !p[k.id] }))}
                  >
                    {perms[k.id] ? 'Вкл' : 'Выкл'}
                  </button>
                </div>
              ))}
            </div>
            <p className="l3-luno-tip dark">
              <strong>Луно:</strong> Приложения не должны получать больше доступа, чем им нужно.
            </p>
            {!permsOk && <p className="l2-err">Отключи доступы по всем пунктам.</p>}
            <button type="button" className="l2-primary" disabled={!permsOk} onClick={applyPerms}>
              Сохранить
            </button>
            <button type="button" className="l3-overlay-close" onClick={close}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {open === 'vt' && (
        <div className="l3-overlay">
          <div className="l3-overlay-inner l3-vt-panel" onClick={(e) => e.stopPropagation()}>
            <div className="l3-vt-logo">◈ VIRUSTOTAL</div>
            <p className="l3-vt-hint">FILE — анализ подозрительных файлов (учебная имитация)</p>
            <div className="l3-vt-zone">
              <p>Выбери файл из папки и нажми «Проверить» — так файл попадает в область проверки.</p>
            </div>
            <div className="l3-file-cards">
              <div className="l3-file-card">
                <span>📄 game_free.exe</span>
                <button type="button" className="l3-file-check" onClick={() => checkFile('exe')}>
                  Проверить
                </button>
                <span className="l3-file-res">{files.exe === null ? '—' : '⚠️ обнаружена угроза'}</span>
              </div>
              <div className="l3-file-card">
                <span>📄 homework.pdf</span>
                <button type="button" className="l3-file-check" onClick={() => checkFile('pdf')}>
                  Проверить
                </button>
                <span className="l3-file-res">{files.pdf === null ? '—' : '✓ файл безопасен'}</span>
              </div>
            </div>
            <p className="l3-luno-tip dark">
              <strong>Луно:</strong> Даже если файл выглядит безопасным, его нужно проверять.
            </p>
            <button type="button" className="l2-primary" disabled={!filesOk} onClick={saveFilesStep}>
              Готово
            </button>
            <button type="button" className="l3-overlay-close" onClick={close}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {open === 'upd' && (
        <div className="l3-overlay">
          <div className="l3-overlay-inner l3-upd-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Доступно обновление системы</h3>
            {upd === 'idle' && (
              <button type="button" className="l3-av-bigbtn" onClick={startUpdate}>
                Установить обновление
              </button>
            )}
            {upd === 'progress' && (
              <div className="l3-scan">
                <p>Обновление…</p>
                <div className="l3-scan-bar">
                  <div className="l3-scan-fill" />
                </div>
              </div>
            )}
            {upd === 'done' && (
              <>
                <p className="l3-av-ok">Система успешно обновлена!</p>
                <p className="l3-luno-tip dark">
                  <strong>Луно:</strong> Обновления устраняют уязвимости, которыми пользуются вирусы.
                </p>
                <button type="button" className="l2-primary" onClick={close}>
                  На рабочий стол
                </button>
              </>
            )}
            {upd !== 'done' && (
              <button type="button" className="l3-overlay-close" onClick={close}>
                Закрыть
              </button>
            )}
          </div>
        </div>
      )}

      {allDone && !showWin && (
        <div className="l2-win">
          <p>Все шаги выполнены.</p>
          <button type="button" className="l2-primary" onClick={() => setShowWin(true)}>
            Завершить
          </button>
        </div>
      )}

      {showWin && (
        <LunoVictoryScreen
          className="luno-victory--l3-game2"
          title="Отличная работа! 🎉"
          onContinue={onComplete}
          continueLabel="Вперёд"
        >
          <p className="l3-luno-finale-lead">
            <strong>Вы научились:</strong>
          </p>
          <ul className="luno-list-plain l3-luno-finale-list">
            <li>защищать устройство</li>
            <li>проверять файлы</li>
            <li>контролировать доступы</li>
            <li>обновлять систему</li>
          </ul>
          <p className="l3-luno-finale-foot">Это реальные действия, которые помогают избежать заражения.</p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
