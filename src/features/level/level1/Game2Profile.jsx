import { useState } from 'react'
import { RichText } from '../../../shared/components/RichText'
import { game2Hotspots } from './level1FlowData'
import { LunoVictoryScreen } from '../../../shared/components/LunoVictoryScreen'
import { MASHA_AVATAR_URLS } from './level1Scenes'
import './level1.css'

export function Game2Profile({ onComplete, lunoAvatarUrls }) {
  const [found, setFound] = useState(new Set())
  const [lastMsg, setLastMsg] = useState(null)

  const toggle = (id) => {
    if (found.has(id)) return
    const spot = game2Hotspots.find((h) => h.id === id)
    setFound((f) => new Set([...f, id]))
    setLastMsg(spot?.luno || '')
  }

  const done = found.size === game2Hotspots.length

  return (
    <div className="l1-game">
      <h2>Игра 2: Анализ профиля Маши</h2>
      <p className="l1-hint">
        Нажимай на фрагменты профиля, которые повышают риск. Нужно найти все опасные элементы (
        {game2Hotspots.length}).
      </p>

      <div className="l1-social-shell">
        <div className="l1-social-top">
          <div className="l1-social-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span>Соцсеть · профиль</span>
        </div>
        <div className="l1-social-body">
          <div className="l1-social-profile-card">
            <div className="l1-social-avatar" aria-hidden>
              👤
            </div>
            <div className="l1-social-name">Профиль</div>

            <div className="l1-profile-mock l1-profile-mock-inner">
              <div className="l1-profile-header">
                <button
                  type="button"
                  className={`l1-hotspot l1-hotspot-photo ${found.has('school_photo') ? 'l1-found' : ''}`}
                  onClick={() => toggle('school_photo')}
                  title="Фото (школа на фоне)"
                >
                  <img
                    src={MASHA_AVATAR_URLS[0]}
                    alt="Фото профиля"
                    className="l1-hotspot-photo-img"
                    draggable={false}
                  />
                </button>
                <div>
                  <button
                    type="button"
                    className={`l1-hotspot-inline ${found.has('fullname') ? 'l1-found' : ''}`}
                    onClick={() => toggle('fullname')}
                  >
                    Мария Ивановна Петрова
                  </button>
                </div>
              </div>
              <p>
                Статус:{' '}
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('status') ? 'l1-found' : ''}`}
                  onClick={() => toggle('status')}
                >
                  «Учусь в школе №27, 7Б класс 💙»
                </button>
              </p>
              <div className="l1-profile-about">
                <strong>О себе:</strong>
                <br />
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('dob') ? 'l1-found' : ''}`}
                  onClick={() => toggle('dob')}
                >
                  Дата рождения: 14 мая 2012
                </button>
                <br />
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('city') ? 'l1-found' : ''}`}
                  onClick={() => toggle('city')}
                >
                  Город: Нижний Новгород
                </button>
                <br />
                Телефон:{' '}
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('phone') ? 'l1-found' : ''}`}
                  onClick={() => toggle('phone')}
                >
                  +7 952 378-15-12
                </button>
                <br />
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('park') ? 'l1-found' : ''}`}
                  onClick={() => toggle('park')}
                >
                  Люблю гулять в парке «Солнечный»
                </button>
              </div>
              <div className="l1-albums">
                <strong>Альбомы:</strong>
                <button
                  type="button"
                  className={`l1-hotspot-block ${found.has('album') ? 'l1-found' : ''}`}
                  onClick={() => toggle('album')}
                >
                  «Как хорошо дома» — фото дома, подъезд, номер
                </button>
              </div>
              <p>
                Последний пост:{' '}
                <button
                  type="button"
                  className={`l1-hotspot-inline ${found.has('post') ? 'l1-found' : ''}`}
                  onClick={() => toggle('post')}
                >
                  «Еду на соревнования в 15:00, наконец-то!»
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {lastMsg && (
        <div className="l1-luno-box">
          <strong>Луно:</strong> <RichText>{lastMsg}</RichText>
        </div>
      )}
      <p className="l1-progress">
        Найдено уязвимостей: {found.size} / {game2Hotspots.length}
      </p>
      {done && (
        <LunoVictoryScreen
          title="Супер!"
          onContinue={onComplete}
          continueLabel="Вперёд"
          lunoAvatarUrls={lunoAvatarUrls}
        >
          <p>
            <RichText>
              Вы нашли все уязвимости! **Отлично!** Теперь ты понимаешь, почему важно контролировать каждую
              **опубликованную деталь**.
            </RichText>
          </p>
        </LunoVictoryScreen>
      )}
    </div>
  )
}
