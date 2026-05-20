import { useRef, useEffect } from 'react'

export default function MobileSheetHeader({ tab, setTab, open, setOpen, counts }) {
  const tabs = [
    { id: 'image', label: 'IMAGE', badge: counts.hasImage ? '•' : '' },
    { id: 'layers', label: 'LAYERS', badge: counts.layers > 0 ? String(counts.layers) : '' },
    { id: 'edit', label: 'EDIT', badge: counts.hasSel ? '•' : '' },
  ]

  const grabRef = useRef(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging.current) return
      const currentY = e.clientY
      const deltaY = currentY - startY.current
      const side = grabRef.current?.closest('.side')
      if (side) {
        let newH = startH.current - deltaY
        if (newH < 52) newH = 52
        side.style.maxHeight = `${newH}px`
      }
    }

    const handlePointerUp = (e) => {
      if (!isDragging.current) return
      isDragging.current = false
      const side = grabRef.current?.closest('.side')
      if (side) {
        side.style.transition = ''
        side.style.maxHeight = ''
      }

      const currentY = e.clientY
      const deltaY = currentY - startY.current

      if (deltaY < -20) {
        setOpen(true)
      } else if (deltaY > 20) {
        setOpen(false)
      } else if (Math.abs(deltaY) < 5) {
        setOpen((prev) => !prev)
      }
    }

    const preventScroll = (e) => {
      if (isDragging.current) e.preventDefault()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', preventScroll)
    }
  }, [setOpen])

  const handlePointerDown = (e) => {
    isDragging.current = true
    startY.current = e.clientY
    const side = grabRef.current?.closest('.side')
    if (side) {
      startH.current = side.getBoundingClientRect().height
      side.style.transition = 'none'
    }
    if (grabRef.current) {
      grabRef.current.setPointerCapture(e.pointerId)
    }
  }

  return (
    <div className="sheet-hdr">
      <button
        ref={grabRef}
        className="sheet-grab"
        onPointerDown={handlePointerDown}
        aria-label={open ? 'close panel' : 'open panel'}
      >
        <span className="grab-bar" />
      </button>
      <div className="sheet-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={'sheet-tab ' + (tab === t.id && open ? 'is-on' : '')}
            onClick={() => {
              if (tab === t.id && open) {
                setOpen(false)
              } else {
                setTab(t.id)
                setOpen(true)
              }
            }}
          >
            <span>{t.label}</span>
            {t.badge && <span className="sheet-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
