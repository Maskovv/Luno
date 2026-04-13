/**
 * Векторные иллюстрации для карусели (без внешних картинок).
 * index: 1…10 — соответствует порядку в carouselSlides.
 */
export function Level2CarouselSlideArt({ index }) {
  const common = { role: 'img', 'aria-hidden': true }

  switch (index) {
    case 1:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fce4ec" />
              <stop offset="100%" stopColor="#f8bbd0" />
            </linearGradient>
          </defs>
          <rect width="320" height="320" fill="url(#g1)" />
          <rect x="24" y="40" width="120" height="72" rx="8" fill="#ff4081" opacity="0.85" />
          <rect x="160" y="56" width="100" height="56" rx="6" fill="#ab47bc" opacity="0.8" />
          <rect x="48" y="140" width="220" height="100" rx="10" fill="#fff" stroke="#e91e63" strokeWidth="3" />
          <text x="160" y="188" textAnchor="middle" fill="#c2185b" fontSize="22" fontWeight="800" fontFamily="system-ui,sans-serif">
            AD
          </text>
          <text x="160" y="218" textAnchor="middle" fill="#888" fontSize="14" fontFamily="system-ui,sans-serif">
            Купи сейчас!!!
          </text>
          <circle cx="270" cy="48" r="28" fill="#ffeb3b" stroke="#f57f17" strokeWidth="2" />
          <text x="270" y="56" textAnchor="middle" fill="#e65100" fontSize="28" fontWeight="900">
            !
          </text>
        </svg>
      )
    case 2:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#e0f7f4" />
          <text x="48" y="100" fill="#00897b" fontSize="42" fontWeight="900" fontFamily="Georgia,serif" transform="rotate(-8 48 100)">
            П
          </text>
          <text x="120" y="88" fill="#004d40" fontSize="38" fontWeight="700" fontFamily="system-ui,sans-serif" transform="rotate(12 120 88)">
            M
          </text>
          <text x="200" y="110" fill="#26a69a" fontSize="36" fontWeight="800" transform="rotate(-14 200 110)">
            А
          </text>
          <text x="240" y="180" fill="#c62828" fontSize="44" fontWeight="900">
            Т
          </text>
          <path d="M40 200 Q160 160 280 200" fill="none" stroke="#80cbc4" strokeWidth="4" strokeDasharray="8 6" />
          <rect x="60" y="220" width="200" height="56" rx="8" fill="#fff" stroke="#00695c" strokeWidth="2" />
          <text x="160" y="256" textAnchor="middle" fill="#546e7a" fontSize="16" fontFamily="system-ui,sans-serif">
            орфаграфия…
          </text>
        </svg>
      )
    case 3:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#fff9c4" />
          <rect x="100" y="72" width="120" height="100" rx="12" fill="#ffca28" stroke="#f57f17" strokeWidth="3" />
          <path d="M100 120 L160 72 L220 120" fill="#fdd835" stroke="#f57f17" strokeWidth="2" />
          <text x="160" y="210" textAnchor="middle" fill="#e65100" fontSize="20" fontWeight="900" fontFamily="system-ui,sans-serif">
            Ты выиграл!
          </text>
          <text x="160" y="248" textAnchor="middle" fill="#6d4c41" fontSize="15" fontWeight="700">
            Лотерея • Срочно
          </text>
          <circle cx="72" cy="48" r="10" fill="#ff7043" />
          <circle cx="248" cy="52" r="12" fill="#ff7043" />
          <circle cx="160" cy="32" r="8" fill="#ffb300" />
        </svg>
      )
    case 4:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#fce4ec" />
          <rect x="32" y="100" width="256" height="140" rx="12" fill="#fff" stroke="#ad1457" strokeWidth="3" />
          <rect x="48" y="120" width="224" height="36" rx="6" fill="#f3e5f5" stroke="#7b1fa2" strokeWidth="2" strokeDasharray="4 3" />
          <text x="160" y="144" textAnchor="middle" fill="#6a1b9a" fontSize="13" fontFamily="monospace">
            ththtps://???????.ru
          </text>
          <circle cx="90" cy="200" r="8" fill="#e91e63" />
          <circle cx="120" cy="210" r="6" fill="#9c27b0" />
          <text x="140" y="208" fill="#c2185b" fontSize="22" fontWeight="800">
            @
          </text>
          <text x="200" y="215" fill="#4a148c" fontSize="18" fontWeight="700">
            ???
          </text>
        </svg>
      )
    case 5:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#ffebee" />
          <rect x="48" y="56" width="224" height="200" rx="14" fill="#1a237e" opacity="0.92" />
          <rect x="72" y="88" width="176" height="28" rx="4" fill="#3949ab" />
          <rect x="72" y="128" width="120" height="22" rx="4" fill="#5c6bc0" />
          <rect x="72" y="168" width="176" height="22" rx="4" fill="#7e57c2" />
          <circle cx="248" cy="180" r="36" fill="#311b92" opacity="0.5" />
          <text x="248" y="190" textAnchor="middle" fill="#fff" fontSize="40">
            ?
          </text>
          <rect x="88" y="220" width="48" height="32" rx="4" fill="#ffcdd2" transform="rotate(-12 112 236)" />
          <rect x="160" y="224" width="48" height="32" rx="4" fill="#ffcdd2" transform="rotate(8 184 240)" />
        </svg>
      )
    case 6:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#ffccbc" />
          <rect x="40" y="80" width="110" height="160" rx="10" fill="#1565c0" />
          <text x="95" y="140" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">
            BRAND
          </text>
          <rect x="170" y="80" width="110" height="160" rx="10" fill="#c62828" />
          <text x="225" y="150" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">
            ???
          </text>
          <path d="M150 200 L170 220" stroke="#333" strokeWidth="4" />
          <path d="M170 200 L150 220" stroke="#333" strokeWidth="4" />
        </svg>
      )
    case 7:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#ede7f6" />
          <rect x="100" y="60" width="120" height="200" rx="16" fill="#5e35b1" stroke="#4527a0" strokeWidth="4" />
          <rect x="118" y="88" width="84" height="64" rx="8" fill="#b39ddb" />
          <text x="160" y="128" textAnchor="middle" fill="#4a148c" fontSize="11" fontWeight="900" fontFamily="monospace">
            JASPERSKY
          </text>
          <circle cx="160" cy="200" r="28" fill="#fff" opacity="0.2" />
          <text x="160" y="208" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">
            ✓
          </text>
          <path d="M60 240 L100 200 M260 240 L220 200" stroke="#9575cd" strokeWidth="3" opacity="0.6" />
        </svg>
      )
    case 8:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#fff3e0" />
          <rect x="56" y="88" width="208" height="140" rx="8" fill="#90a4ae" />
          <rect x="68" y="104" width="184" height="100" rx="4" fill="#eceff1" />
          <rect x="88" y="120" width="144" height="64" rx="6" fill="#ffeb3b" stroke="#f57f17" strokeWidth="3" />
          <text x="160" y="162" textAnchor="middle" fill="#bf360c" fontSize="48" fontWeight="900">
            !
          </text>
          <text x="160" y="210" textAnchor="middle" fill="#d84315" fontSize="13" fontWeight="800">
            СРОЧНО
          </text>
        </svg>
      )
    case 9:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#e3f2fd" />
          <rect x="72" y="100" width="176" height="120" rx="8" fill="#fff" stroke="#1976d2" strokeWidth="3" />
          <path
            d="M96 120 L160 168 L224 120 L224 200 L96 200 Z"
            fill="#bbdefb"
            stroke="#1565c0"
            strokeWidth="2"
          />
          <text x="160" y="168" textAnchor="middle" fill="#0d47a1" fontSize="56" fontWeight="300">
            ?
          </text>
          <text x="160" y="248" textAnchor="middle" fill="#546e7a" fontSize="13">
            Контакты: —
          </text>
        </svg>
      )
    case 10:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#e8f5e9" />
          <rect x="40" y="100" width="240" height="120" rx="10" fill="#fff" stroke="#66bb6a" strokeWidth="3" />
          <rect x="56" y="116" width="200" height="28" rx="6" fill="#c8e6c9" />
          <text x="156" y="136" textAnchor="middle" fill="#c62828" fontSize="16" fontWeight="800" fontFamily="monospace">
            http://
          </text>
          <circle cx="160" cy="188" r="22" fill="none" stroke="#e53935" strokeWidth="4" />
          <path d="M148 176 L172 200 M172 176 L148 200" stroke="#e53935" strokeWidth="4" strokeLinecap="round" />
          <text x="160" y="260" textAnchor="middle" fill="#2e7d32" fontSize="14" fontWeight="700">
            нет HTTPS
          </text>
        </svg>
      )
    default:
      return (
        <svg {...common} className="l2-carousel-svg" viewBox="0 0 320 320">
          <rect width="320" height="320" fill="#f5f5f5" />
          <text x="160" y="168" textAnchor="middle" fill="#999" fontSize="18">
            {index}
          </text>
        </svg>
      )
  }
}
