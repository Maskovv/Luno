import { useState } from 'react'
import { CharacterAvatar } from '../../../shared/components/CharacterAvatar'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import {
  LUNO_AFTER_PARENTS_SUPPORT,
  LUNO_AFTER_TROLL_DM,
  LUNO_REPLY_TO_HATER,
  REPLY_TO_HATER_CHAT,
  THREAT_LUNO_BLOCK,
  THREAT_LUNO_FIND,
  THREAT_LUNO_PARENTS_OK,
  TROLL_DM_FULL_CHAT,
  VANYA_MASHA_DM_FULL,
} from './level5FlowData'
import { ANYA_LEVEL5_URLS, VANYA_LEVEL5_URLS } from './level5Scenes'
import { LUNO_AVATAR_URLS, MASHA_AVATAR_URLS } from '../level1/level1Scenes'

const COMMENTS = ['Это кринж', 'Ты вообще видела себя?', 'Удались отсюда', 'Смешно даже смотреть']

const THREAT_COMMENTS = [
  'Лёше ты никогда не понравишься… Если будешь с ним общаться, я найду тебя! Я знаю, где ты живёшь.',
  'Жди свой номер в позорном паблике… Если не веришь, что я знаю твой номер — ты ошибаешься: 89526784511',
  'Будешь выпендриваться — я всем расскажу твой секрет. Тогда мы все над тобой посмеёмся.',
  'В 33 школе все такие глупые, как ты?',
]

function VkShell({ children }) {
  return (
    <div className="l5-root">
      <div className="l5-vk-top">
        <span className="l5-vk-logo">VK</span>
        <div className="l5-vk-search">🔍 Поиск</div>
        <div className="l5-vk-icons" aria-hidden>
          🏠 ☰
        </div>
      </div>
      <div className="l5-vk-body">{children}</div>
    </div>
  )
}

export function ChatModal({ items, onClose, closeLabel = 'Закрыть' }) {
  return (
    <div className="l5-modal-backdrop" role="dialog" aria-modal="true">
      <div className="l5-modal l5-modal-chat l5-modal-wide l5-modal-chat--layout">
        <div className="l5-modal-chat-scroll">
          <div className="l5-msg-list">
            {items.map((item, idx) => (
              <div
                key={`${item.who}_${idx}`}
                className="l5-msg-card"
                style={{
                  background: item.who === 'Маша' ? 'var(--vk-post)' : 'var(--vk-post-dark)',
                }}
              >
                <div className="l5-msg-avatar">
                  {item.who === 'Тролль' ? (
                    <CharacterAvatar name="Тролль" />
                  ) : item.who === 'Пользователь' ? (
                    <CharacterAvatar name="Пользователь" />
                  ) : item.who === 'Ваня' ? (
                    <LunoPhoto urls={VANYA_LEVEL5_URLS} className="l5-msg-avatar-img" alt="" />
                  ) : item.who === 'Аня' ? (
                    <LunoPhoto urls={ANYA_LEVEL5_URLS} className="l5-msg-avatar-img" alt="" />
                  ) : (
                    <LunoPhoto urls={MASHA_AVATAR_URLS} className="l5-msg-avatar-img" alt="" />
                  )}
                </div>
                <div className="l5-msg-body">
                  <div className="l5-msg-name">{item.who}</div>
                  <div className="l5-msg-text">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="l5-modal-chat-footer">
          <button type="button" className="l5-btn-primary l5-btn-modal-compact" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function LunoModal({ lines, onClose, buttonLabel = 'Понятно' }) {
  return (
    <div className="l5-modal-backdrop" role="dialog" aria-modal="true">
      <div className="l5-modal">
        <div className="l5-modal-luno-avatar">
          <LunoPhoto urls={LUNO_AVATAR_URLS} className="l5-luno-modal-photo" alt="" />
        </div>
        <h3 className="l5-modal-luno-title">Луно</h3>
        <div className="l5-modal-luno-body">
          {lines.map((line, i) => (
            <p key={i}>
              <RichText>{line}</RichText>
            </p>
          ))}
        </div>
        <div className="l5-modal-chat-footer">
          <button type="button" className="l5-btn-primary l5-btn-modal-compact" onClick={onClose}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Игра 1 — страница Маши; по завершении вызывает onNext.
 */
export function Level5Game1({ onNext }) {
  const [blocked, setBlocked] = useState([])
  const [phase, setPhase] = useState('comments')
  const [dmState, setDmState] = useState({ trollBlocked: false, friendReplied: false })
  const [modal, setModal] = useState(null)

  const blockComment = (c) => {
    if (blocked.includes(c)) return
    const next = [...blocked, c]
    setBlocked(next)
    if (next.length === COMMENTS.length) setPhase('messages')
  }

  const doneDm = dmState.trollBlocked && dmState.friendReplied
  const showThreats = phase === 'messages' && doneDm

  const messagesOnly = phase === 'messages' && !doneDm

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Игра 1: Страница Маши</h2>
      <p className="l5-game-hint">
        {phase === 'comments' && 'Заблокируй всех троллей под постом. Отвечать опаснее — диалог может обостриться.'}
        {messagesOnly && 'В сообщениях: заблокируй тролля и ответь другу Ване.'}
        {showThreats && 'Появились угрозы и слив данных. Выбери безопасное действие.'}
      </p>

      <VkShell>
        <div className="l5-vk-grid">
          <aside className="l5-profile-card">
            <div className="l5-profile-avatar">
              <LunoPhoto urls={MASHA_AVATAR_URLS} className="l5-profile-avatar-img" alt="" />
            </div>
            <p className="l5-profile-name">Маша</p>
            <div className="l5-profile-meta">
              Дата рождения: 12 мая
              <br />
              Образование: школа №33
            </div>
            <div className="l5-profile-icons" aria-hidden>
              👤 🎵 💬
            </div>
          </aside>
          <main>
            <div className="l5-feed-heading">
              <h3 className="l5-feed-title">Мои записи</h3>
            </div>
            {phase === 'comments' && (
              <article className="l5-post">
                <div className="l5-post-preview">Пост Маши</div>
                <div className="l5-feed-heading l5-feed-heading--sub">
                  <h4 className="l5-feed-subtitle">Комментарии под постом</h4>
                </div>
                {COMMENTS.map((c) => (
                  <div key={c} className="l5-comment-row">
                    <span className="l5-comment-text">{c}</span>
                    <div className="l5-comment-actions">
                      {blocked.includes(c) ? (
                        <span className="l5-badge-done">✓ Заблокирован</span>
                      ) : (
                        <>
                          <button type="button" className="l5-btn-vk l5-btn-block" onClick={() => blockComment(c)}>
                            Заблокировать
                          </button>
                          <button type="button" className="l5-btn-vk l5-btn-reply" onClick={() => setModal('replyChat')}>
                            Ответить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </article>
            )}

            {messagesOnly && (
              <div className="l5-msg-list">
                <p className="l5-section-title">Мои сообщения</p>
                <div className="l5-msg-card">
                  <div className="l5-msg-avatar">
                    <CharacterAvatar name="Тролль" />
                  </div>
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
                      <button type="button" className="l5-btn-vk l5-btn-reply" onClick={() => setModal('trollDmChat')}>
                        Ответить
                      </button>
                    </div>
                  </div>
                </div>
                <div className="l5-msg-card" style={{ background: 'var(--vk-post-dark)' }}>
                  <div className="l5-msg-avatar">
                    <LunoPhoto urls={VANYA_LEVEL5_URLS} className="l5-msg-avatar-img" alt="" />
                  </div>
                  <div className="l5-msg-body">
                    <div className="l5-msg-name">Ваня</div>
                    <div className="l5-msg-text">
                      Привет, Маша, как ты? Ты быстро ушла после школы — всё в порядке?
                    </div>
                    <div className="l5-comment-actions" style={{ marginTop: 10 }}>
                      <button type="button" className="l5-btn-vk l5-btn-block" onClick={() => setModal('blockVanya')}>
                        Заблокировать
                      </button>
                      <button
                        type="button"
                        className="l5-btn-vk l5-btn-reply"
                        onClick={() => setModal('friendDm')}
                        disabled={dmState.friendReplied}
                      >
                        {dmState.friendReplied ? '✓ Ответил' : 'Ответить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showThreats && (
              <>
                <div className="l5-feed-heading l5-feed-heading--sub">
                  <h4 className="l5-feed-subtitle">Комментарии под постом</h4>
                </div>
                {THREAT_COMMENTS.map((t) => (
                  <div key={t} className="l5-threat-box">
                    <p>{t}</p>
                  </div>
                ))}
                <div className="l5-actions-stack">
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('threatFind')}>
                    Узнать, откуда они всё знают
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('threatBlock')}>
                    Заблокировать всех
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('parentsLuno1')}>
                    Рассказать родителям
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </VkShell>

      {modal === 'replyChat' && (
        <ChatModal items={REPLY_TO_HATER_CHAT} onClose={() => setModal('replyLuno')} closeLabel="Далее" />
      )}
      {modal === 'replyLuno' && (
        <LunoModal lines={LUNO_REPLY_TO_HATER} onClose={() => setModal(null)} buttonLabel="Попробовать снова" />
      )}

      {modal === 'blockVanya' && (
        <LunoModal
          lines={['Блокировать Ваню не стоит: он пытается **поддержать** тебя, а не травить.']}
          onClose={() => setModal(null)}
          buttonLabel="Понятно"
        />
      )}

      {modal === 'trollDmChat' && (
        <ChatModal items={TROLL_DM_FULL_CHAT} onClose={() => setModal('trollDmLuno')} closeLabel="Далее" />
      )}
      {modal === 'trollDmLuno' && (
        <LunoModal lines={LUNO_AFTER_TROLL_DM} onClose={() => setModal(null)} buttonLabel="Попробовать снова" />
      )}

      {modal === 'friendDm' && (
        <ChatModal
          items={VANYA_MASHA_DM_FULL}
          onClose={() => {
            setDmState((s) => ({ ...s, friendReplied: true }))
            setModal(null)
          }}
          closeLabel="Закрыть"
        />
      )}

      {modal === 'threatFind' && (
        <LunoModal lines={THREAT_LUNO_FIND} onClose={() => setModal(null)} buttonLabel="Попробовать снова" />
      )}
      {modal === 'threatBlock' && (
        <LunoModal lines={THREAT_LUNO_BLOCK} onClose={() => setModal(null)} buttonLabel="Попробовать снова" />
      )}

      {modal === 'parentsLuno1' && (
        <LunoModal lines={THREAT_LUNO_PARENTS_OK} onClose={() => setModal('parentsChat')} buttonLabel="Далее" />
      )}
      {modal === 'parentsChat' && (
        <ChatModal items={VANYA_MASHA_DM_FULL} onClose={() => setModal('parentsLuno2')} closeLabel="Далее" />
      )}
      {modal === 'parentsLuno2' && (
        <LunoModal lines={LUNO_AFTER_PARENTS_SUPPORT} onClose={() => onNext()} buttonLabel="Вперёд" />
      )}
    </div>
  )
}
