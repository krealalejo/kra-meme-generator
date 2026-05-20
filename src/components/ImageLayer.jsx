import { memo } from 'react'
import PropTypes from 'prop-types'
import { clamp } from '../utils/text'
import { startDrag } from '../hooks/useDrag'

const ImageLayer = memo(function ImageLayer({ layer, box, selected, onSelect, onUpdate }) {
  const pxW = layer.w * box.w
  const pxH = pxW / layer.aspectRatio

  const style = {
    left: `${layer.x * 100}%`,
    top: `${layer.y * 100}%`,
    width: pxW,
    height: pxH,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelect(layer.id)
    if (e.target.dataset.role === 'handle') return
    const { x, y } = layer
    startDrag(e, (dx, dy) => onUpdate(layer.id, {
      x: clamp(x + dx / box.w, 0, 1),
      y: clamp(y + dy / box.h, 0, 1),
    }))
  }

  const onResizeDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(layer.id)
    const { w } = layer
    startDrag(e, (dx) => onUpdate(layer.id, { w: clamp(w + (dx * 2) / box.w, 0.05, 1.5) }))
  }

  return (
    <div
      className={'layer layer-img ' + (selected ? 'is-selected' : '')}
      style={style}
      onPointerDown={onPointerDown}
    >
      <img
        src={layer.src}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'fill', pointerEvents: 'none' }}
      />
      {selected && (
        <>
          <span className="layer-frame" />
          <span
            className="handle handle-resize mono"
            data-role="handle"
            onPointerDown={onResizeDown}
          >
            ↔
          </span>
        </>
      )}
    </div>
  )
})

ImageLayer.propTypes = {
  layer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    aspectRatio: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
  }).isRequired,
  box: PropTypes.shape({ w: PropTypes.number.isRequired, h: PropTypes.number.isRequired }).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

export default ImageLayer
