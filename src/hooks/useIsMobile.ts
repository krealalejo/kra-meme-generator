import { useState, useEffect } from 'react'

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(max-width: 820px)').matches
  )
  useEffect(() => {
    const mq = globalThis.matchMedia('(max-width: 820px)')
    const h = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return isMobile
}
