import { memo } from 'react'
import { clamp } from '../utils/text'
import { startDrag } from '../hooks/useDrag'
import type { ImageLayerData, Box, LayerPatch } from '../types'

interface ImageLayerProps {
  layer: ImageLayerData
  box: Box
  selected: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: LayerPatch) => void
}

const ImageLayer = memo(function ImageLayer({ layer, box, selected, onSelect, onUpdate }: ImageLayerProps) {
  const pxW = layer.w * box.w
  const pxH = pxW / layer.aspectRatio

  const style: React.CSSProperties = {
    left: `${layer.x * 100}%`,
    top: `${layer.y * 100}%`,
    width: pxW,
    height: pxH,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    onSelect(layer.id)
    /* v8 ignore next -- handle pointerdown stops propagation before reaching here */
    if ((e.target as HTMLElement).dataset.role === 'handle') return
    const { x, y } = layer
    startDrag(e.nativeEvent, (dx, dy) => onUpdate(layer.id, {
      x: clamp(x + dx / box.w, 0, 1),
      y: clamp(y + dy / box.h, 0, 1),
    }))
  }

  const onResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(layer.id)
    const { w } = layer
    startDrag(e.nativeEvent, (dx) => onUpdate(layer.id, { w: clamp(w + (dx * 2) / box.w, 0.05, 1.5) }))
  }

  const onRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(layer.id)
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx)
    const startX = e.clientX
    const startY = e.clientY
    const { rotation } = layer
    startDrag(e.nativeEvent, (dx, dy) => {
      const angle = Math.atan2(startY + dy - cy, startX + dx - cx)
      const deltaDeg = (angle - startAngle) * (180 / Math.PI)
      onUpdate(layer.id, { rotation: Math.round(rotation + deltaDeg) })
    })
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
          <span
            className="handle handle-rotate mono"
            data-role="handle"
            onPointerDown={onRotateDown}
          >
            ⟳
          </span>
        </>
      )}
    </div>
  )
})

export default ImageLayer
