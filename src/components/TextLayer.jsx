import { useRef } from 'react'
import { FONTS } from '../constants'
import { clamp } from '../utils/text'

export default function TextLayer({ t, box, selected, onSelect, onUpdate }) {
  const ref = useRef(null)

  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelect()
    if (e.target.dataset.role === 'handle') return
    const startX = e.clientX
    const startY = e.clientY
    const startTX = t.x
    const startTY = t.y
    const move = (ev) => {
      const dx = (ev.clientX - startX) / box.w
      const dy = (ev.clientY - startY) / box.h
      onUpdate({ x: clamp(startTX + dx, 0, 1), y: clamp(startTY + dy, 0, 1) })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onResizeDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    const startY = e.clientY
    const startSize = t.size
    const move = (ev) => {
      const dy = (ev.clientY - startY) / box.h
      onUpdate({ size: clamp(startSize + dy, 0.02, 0.4) })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const fontDef = FONTS.find((f) => f.id === t.font) || FONTS[0]
  const px = Math.max(8, t.size * box.h)

  const style = {
    left: `${t.x * 100}%`,
    top: `${t.y * 100}%`,
    fontFamily: fontDef.css,
    fontSize: px,
    color: t.color,
    fontWeight: t.weight,
    letterSpacing: t.tracking + 'em',
    textTransform: t.uppercase ? 'uppercase' : 'none',
    transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
    WebkitTextStroke: `${t.stroke * px * 0.06}px ${t.strokeColor}`,
    textShadow: t.shadow ? '0 4px 14px rgba(0,0,0,0.45)' : 'none',
    textAlign: 'center',
    lineHeight: 1.02,
  }

  return (
    <div
      ref={ref}
      className={'layer ' + (selected ? 'is-selected' : '')}
      style={style}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        e.stopPropagation()
        const val = prompt('edit text', t.text)
        if (val !== null) onUpdate({ text: val })
      }}
    >
      <span className="layer-text">{t.text || '…'}</span>
      {selected && (
        <>
          <span className="layer-frame" />
          <span
            className="handle handle-resize mono"
            data-role="handle"
            onPointerDown={onResizeDown}
          >
            ↕
          </span>
        </>
      )}
    </div>
  )
}
