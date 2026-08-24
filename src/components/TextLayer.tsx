import { memo } from 'react'
import { FONTS } from '../constants'
import { clamp } from '../utils/text'
import { startDrag } from '../hooks/useDrag'
import type { TextLayerData, Box, LayerPatch } from '../types'

interface TextLayerProps {
  t: TextLayerData
  box: Box
  selected?: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: LayerPatch) => void
}

const TextLayer = memo(function TextLayer({ t, box, selected, onSelect, onUpdate }: TextLayerProps) {
  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    onSelect(t.id)
    /* v8 ignore next -- handle pointerdown stops propagation before reaching here */
    if ((e.target as HTMLElement).dataset.role === 'handle') return
    const { x, y } = t
    startDrag(e.nativeEvent, (dx, dy) => onUpdate(t.id, {
      x: clamp(x + dx / box.w, 0, 1),
      y: clamp(y + dy / box.h, 0, 1),
    }))
  }

  const onResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(t.id)
    const { size } = t
    startDrag(e.nativeEvent, (dx, dy) => onUpdate(t.id, { size: clamp(size + (dx + dy) / 2 / box.h, 0.02, 0.4) }))
  }

  const fontDef = FONTS.find((f) => f.id === t.font) || FONTS[0]
  const px = Math.max(8, t.size * box.h)

  const style: React.CSSProperties = {
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
    <button
      type="button"
      className={'layer ' + (selected ? 'is-selected' : '')}
      style={style}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(t.id) }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        const val = prompt('edit text', t.text)
        if (val !== null) onUpdate(t.id, { text: val })
      }}
    >
      <span className="layer-text">{t.text || '…'}</span>
      {selected && (
        <>
          <span className="layer-frame" />
          <span
            className="handle handle-resize handle-resize-diag mono"
            data-role="handle"
            onPointerDown={onResizeDown}
          >
            ⤡
          </span>
        </>
      )}
    </button>
  )
})

export default TextLayer
