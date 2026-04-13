import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './QRCodePage.css'
import { useAuth } from '../auth'
import { createClassSession } from '../../shared/api/firestoreClasses'
import { UserAccountBar } from '../../shared/components/UserAccountBar'

export function QRCodePage() {
  const [url, setUrl] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const classId = await createClassSession({ teacherUid: user.uid })
      const u = `${window.location.origin}/login?class=${encodeURIComponent(classId)}`
      if (!cancelled) setUrl(u)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="qr-page">
      <div className="qr-page-top">
        <UserAccountBar tone="light" />
      </div>
      <div className="qr-container">
        <h1>Подключение к игре</h1>
        <p>Отсканируйте QR-код для подключения</p>
        <div className="qr-code-wrapper">
          {url && <QRCodeSVG value={url} size={300} />}
        </div>
        <div className="qr-url">
          <p>Или перейдите по ссылке (в этом же окне):</p>
          <a href={url}>
            {url}
          </a>
        </div>
      </div>
    </div>
  )
}

