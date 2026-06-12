import { forwardRef, memo, useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import TextLayer from './TextLayer'
import ImageLayer from './ImageLayer'
import type { MemeImage, Layer, Box, LayerPatch } from '../types'

interface StageMetaProps {
  image: MemeImage
  box: Box
  count: number
}

const StageMeta = memo(function StageMeta({ image, box, count }: StageMetaProps) {
  return (
    <div className="stage-meta mono">
      <span>{image.w}×{image.h}px</span>
      <span className="dot">•</span>
      <span>{count} {count === 1 ? 'layer' : 'layers'}</span>
      <span className="dot">•</span>
      <span>scale {box.w ? Math.round((box.w / image.w) * 100) : 0}%</span>
    </div>
  )
})

interface StageProps {
  image: MemeImage
  layers: Layer[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  updateLayer: (id: string, patch: LayerPatch) => void
}

const Stage = forwardRef<HTMLDivElement, StageProps>(function Stage(
  { image, layers, selectedId, setSelectedId, updateLayer },
  ref
) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box>({ w: 0, h: 0 })

  const handleSelect = useCallback((id: string) => setSelectedId(id), [setSelectedId])
  const handleUpdate = useCallback((id: string, patch: LayerPatch) => updateLayer(id, patch), [updateLayer])

  useEffect(() => {
    /* v8 ignore next -- innerRef is always set when the mount effect runs */
    if (innerRef.current) {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }
      )
    }
  }, [])

  useEffect(() => {
    /* v8 ignore next -- innerRef always set once mounted */
    const el = innerRef.current?.parentElement
    /* v8 ignore next -- parent always present once mounted */
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      const maxW = r.width - 32
      const maxH = r.height - 32
      const ratio = image.w / image.h
      let w = maxW
      let h = maxW / ratio
      if (h > maxH) { h = maxH; w = maxH * ratio }
      setBox({ w, h })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [image])

  return (
    <div className="stage-outer">
      <div
        className="stage"
        ref={(el) => {
          innerRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        style={{ width: box.w, height: box.h }}
        onMouseDown={(e) => { if ((e.target as HTMLElement).classList.contains('stage')) setSelectedId(null) }}
      >
        <img className="stage-img" src={image.src} alt="" draggable={false} />
        {layers.map((layer) =>
          layer.type === 'image' ? (
            <ImageLayer
              key={layer.id}
              layer={layer}
              box={box}
              selected={layer.id === selectedId}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
            />
          ) : (
            <TextLayer
              key={layer.id}
              t={layer}
              box={box}
              selected={layer.id === selectedId}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
            />
          )
        )}
      </div>
      <StageMeta image={image} box={box} count={layers.length} />
    </div>
  )
})

export default Stage
