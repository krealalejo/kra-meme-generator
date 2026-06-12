import { useRef, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface Counts {
  hasImage: boolean
  layers: number
  hasSel: boolean
}

interface MobileSheetHeaderProps {
  tab: string
  setTab: Dispatch<SetStateAction<string>>
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  counts: Counts
}

export default function MobileSheetHeader({ tab, setTab, open, setOpen, counts }: Readonly<MobileSheetHeaderProps>) {
  const tabs = [
    { id: 'image', label: 'IMAGE' },
    { id: 'layers', label: 'LAYERS', badge: counts.layers > 0 ? String(counts.layers) : '' },
    { id: 'edit', label: 'EDIT' },
  ]

  const grabRef = useRef<HTMLButtonElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const currentY = e.clientY
      const deltaY = currentY - startY.current
      const side = grabRef.current?.closest('.side') as HTMLElement | null
      if (side) {
        let newH = startH.current - deltaY
        if (newH < 52) newH = 52
        side.style.maxHeight = `${newH}px`
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return
      isDragging.current = false
      const side = grabRef.current?.closest('.side') as HTMLElement | null
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

    const preventScroll = (e: Event) => {
      if (isDragging.current) e.preventDefault()
    }

    globalThis.addEventListener('pointermove', handlePointerMove)
    globalThis.addEventListener('pointerup', handlePointerUp)
    globalThis.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      globalThis.removeEventListener('pointermove', handlePointerMove)
      globalThis.removeEventListener('pointerup', handlePointerUp)
      globalThis.removeEventListener('touchmove', preventScroll)
    }
  }, [setOpen])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true
    startY.current = e.clientY
    const side = grabRef.current?.closest('.side') as HTMLElement | null
    if (side) {
      startH.current = side.getBoundingClientRect().height
      side.style.transition = 'none'
    }
    /* v8 ignore next -- grabRef is always attached to the rendered button */
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
