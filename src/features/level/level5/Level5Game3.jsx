import { useState } from 'react'
import { LunoPhoto } from '../../../shared/components/LunoPhoto'
import { RichText } from '../../../shared/components/RichText'
import {
  ANYA_AFTER_PRIVACY_CHAT,
  ANYA_MASHA_SUPPORT_CHAT,
  ANYA_RAGE_QUIT,
  ARGUE_THREAD_CHAT,
  LUNO_AFTER_ARGUE_THREAD,
  LUNO_AFTER_SUPPORTING_TROLL,
  LUNO_BLOCK_WITHOUT_SUPPORT,
} from './level5FlowData'
import { ANYA_LEVEL5_URLS } from './level5Scenes'
import { ChatModal, LunoModal } from './Level5Game1'

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

function PrivacyFormModal({ privacy, setPrivacy, privacyErr, onSubmit, onBack }) {
  return (
    <div className="l5-modal-backdrop" role="dialog" aria-modal="true">
      <div className="l5-modal l5-modal-wide l5-modal--privacy-sheet">
        <p className="l5-privacy-chat-intro">
          <strong>Аня:</strong> Помоги мне настроить страницу — я не хочу, чтобы токсичные люди так легко до меня добирались.
        </p>
        <p className="l5-privacy-luno-hint">
          <RichText>
            Выберите варианты, при которых **личные данные** и **переписка** лучше защищены (не «все пользователи» там,
            где это важно).
          </RichText>
        </p>
        <div className="l5-privacy-form">
          <div className="l5-privacy-row">
            <label>Кто может писать личные сообщения</label>
            <select value={privacy.dm} onChange={(e) => setPrivacy((p) => ({ ...p, dm: e.target.value }))}>
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
            <select value={privacy.comments} onChange={(e) => setPrivacy((p) => ({ ...p, comments: e.target.value }))}>
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
            <select value={privacy.posts} onChange={(e) => setPrivacy((p) => ({ ...p, posts: e.target.value }))}>
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
            <select value={privacy.geo} onChange={(e) => setPrivacy((p) => ({ ...p, geo: e.target.value }))}>
              <option value="">— выберите —</option>
              <option>Все пользователи</option>
              <option>Друзья и друзья друзей</option>
              <option>Все друзья</option>
              <option>Только я</option>
              <option>Некоторые друзья</option>
            </select>
          </div>
        </div>
        {privacyErr && <p className="l2-err l5-privacy-err">{privacyErr}</p>}
        <div className="l5-modal-chat-footer l5-modal-chat-footer--row">
          <button type="button" className="l5-btn-outline l5-btn-modal-compact" onClick={onBack}>
            Назад
          </button>
          <button type="button" className="l5-btn-primary l5-btn-modal-compact" onClick={onSubmit}>
            Сохранить и продолжить
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Игра 3 — страница Ани, ветвления, чат и настройки приватности.
 */
export function Level5Game3({ onNext }) {
  const [modal, setModal] = useState(null)
  const [privacy, setPrivacy] = useState({ dm: '', comments: '', posts: '', geo: '' })
  const [privacyErr, setPrivacyErr] = useState('')

  const donePrivacy =
    ['Все друзья', 'Некоторые друзья'].includes(privacy.dm) &&
    ['Все друзья', 'Только я', 'Некоторые друзья'].includes(privacy.comments) &&
    ['Все друзья', 'Только я', 'Некоторые друзья'].includes(privacy.posts) &&
    ['Только я', 'Некоторые друзья'].includes(privacy.geo)

  const submitPrivacy = () => {
    if (!donePrivacy) {
      setPrivacyErr('Подбери более безопасные настройки для всех пунктов.')
      return
    }
    setPrivacyErr('')
    setModal('anya_privacy_thanks')
  }

  return (
    <div className="l2-card l5-game-card">
      <h2 className="l5-game-title">Игра 3: Страница Ани</h2>
      <p className="l5-game-hint">Помоги Ане: выбери стратегию и пройди сценарий.</p>

      <VkShell>
        <div className="l5-vk-grid">
          <aside className="l5-profile-card">
            <div className="l5-profile-avatar">
              <LunoPhoto urls={ANYA_LEVEL5_URLS} className="l5-profile-avatar-img" alt="" />
            </div>
            <p className="l5-profile-name">Аня</p>
            <div className="l5-profile-meta">
              Дата рождения: 3 марта
            </div>
            <div className="l5-profile-icons" aria-hidden>
              👤 🎵 💬
            </div>
          </aside>
          <main>
            <div className="l5-feed-heading">
              <h3 className="l5-feed-title">Записи Ани</h3>
            </div>
            {!modal && (
              <>
                <div className="l5-mini-post">
                  <strong>Тролль:</strong> «Фу, фотошоп. А без фильтров слабо?»
                </div>
                <div className="l5-mini-post">
                  <strong>Тролль:</strong> «Типо крутая, была в Москве, ахах, Красная площадь не поможет исправить фото с
                  твоим лицом»
                </div>
                <div className="l5-actions-stack">
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('troll_anya')}>
                    Поддержать тролля
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('argue_chat')}>
                    Поддержать Аню
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('report_ok')}>
                    Пожаловаться
                  </button>
                </div>
              </>
            )}

            {modal === 'report_pick' && (
              <div className="l5-post" style={{ marginTop: 12 }}>
                <p className="l5-section-title">Аня написала тебе в личные сообщения. Что ответишь?</p>
                <div className="l5-actions-stack">
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('report_chat')}>
                    Ответить
                  </button>
                  <button type="button" className="l5-btn-threat" onClick={() => setModal('report_block')}>
                    Заблокировать
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </VkShell>

      {modal === 'troll_anya' && (
        <ChatModal
          items={[{ who: 'Аня', text: `«${ANYA_RAGE_QUIT}»` }]}
          onClose={() => setModal('troll_luno')}
          closeLabel="Далее"
        />
      )}
      {modal === 'troll_luno' && (
        <LunoModal
          lines={[LUNO_AFTER_SUPPORTING_TROLL]}
          onClose={() => setModal(null)}
          buttonLabel="Попробовать снова"
        />
      )}

      {modal === 'argue_chat' && (
        <ChatModal items={ARGUE_THREAD_CHAT} onClose={() => setModal('argue_luno')} closeLabel="Далее" />
      )}
      {modal === 'argue_luno' && (
        <LunoModal
          lines={LUNO_AFTER_ARGUE_THREAD}
          onClose={() => setModal(null)}
          buttonLabel="Попробовать снова"
        />
      )}

      {modal === 'report_ok' && (
        <LunoModal lines={['Отлично, Аня оценит твою помощь.']} onClose={() => setModal('report_anya')} buttonLabel="Далее" />
      )}
      {modal === 'report_anya' && (
        <ChatModal
          items={[
            {
              who: 'Аня',
              text: 'Привет! Не понимаю, что происходит, почему они накинулись на меня… мне страшно',
            },
          ]}
          onClose={() => setModal('report_pick')}
          closeLabel="Далее"
        />
      )}

      {modal === 'report_block' && (
        <LunoModal
          lines={[LUNO_BLOCK_WITHOUT_SUPPORT]}
          onClose={() => setModal('report_pick')}
          buttonLabel="Назад к выбору"
        />
      )}

      {modal === 'report_chat' && (
        <ChatModal items={ANYA_MASHA_SUPPORT_CHAT} onClose={() => setModal('report_privacy_form')} closeLabel="Далее" />
      )}

      {modal === 'report_privacy_form' && (
        <PrivacyFormModal
          privacy={privacy}
          setPrivacy={setPrivacy}
          privacyErr={privacyErr}
          onSubmit={submitPrivacy}
          onBack={() => {
            setPrivacyErr('')
            setModal('report_chat')
          }}
        />
      )}

      {modal === 'anya_privacy_thanks' && (
        <ChatModal items={ANYA_AFTER_PRIVACY_CHAT} onClose={() => onNext()} closeLabel="Вперёд" />
      )}
    </div>
  )
}
