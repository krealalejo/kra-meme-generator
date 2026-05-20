import { useState, useEffect } from 'react'

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const h = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return isMobile
}
