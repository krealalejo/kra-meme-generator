import { memo } from 'react'
import PropTypes from 'prop-types'
import { FONTS } from '../constants'
import { clamp } from '../utils/text'
import { startDrag } from '../hooks/useDrag'

const TextLayer = memo(function TextLayer({ t, box, selected, onSelect, onUpdate }) {
  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelect(t.id)
    if (e.target.dataset.role === 'handle') return
    const { x, y } = t
    startDrag(e, (dx, dy) => onUpdate(t.id, {
      x: clamp(x + dx / box.w, 0, 1),
      y: clamp(y + dy / box.h, 0, 1),
    }))
  }

  const onResizeDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(t.id)
    const { size } = t
    startDrag(e, (_, dy) => onUpdate(t.id, { size: clamp(size + dy / box.h, 0.02, 0.4) }))
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
      role="button"
      tabIndex={0}
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
})

TextLayer.propTypes = {
  t: PropTypes.shape({
    id: PropTypes.string.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    size: PropTypes.number,
    font: PropTypes.string,
    color: PropTypes.string,
    weight: PropTypes.number,
    tracking: PropTypes.number,
    uppercase: PropTypes.bool,
    rotation: PropTypes.number,
    stroke: PropTypes.number,
    strokeColor: PropTypes.string,
    shadow: PropTypes.bool,
    text: PropTypes.string,
  }).isRequired,
  box: PropTypes.shape({ w: PropTypes.number.isRequired, h: PropTypes.number.isRequired }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

export default TextLayer
