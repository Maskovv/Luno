import { useState, useEffect } from 'react'

// Хук для получения локального IP адреса
export function useLocalIP() {
  const [ip, setIp] = useState('localhost')
  const [port, setPort] = useState(3000)

  useEffect(() => {
    // В браузере мы не можем напрямую получить локальный IP
    // Поэтому используем WebRTC для получения локального IP
    const getLocalIP = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })
        
        pc.createDataChannel('')
        
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            const match = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/)
            if (match) {
              setIp(match[0])
              pc.close()
            }
          }
        }
      } catch (error) {
        console.error('Ошибка получения IP:', error)
        // Fallback на localhost
        setIp('localhost')
      }
    }

    getLocalIP()
    
    // Получаем порт из window.location если доступен
    if (window.location.port) {
      setPort(window.location.port)
    }
  }, [])

  return { ip, port }
}

