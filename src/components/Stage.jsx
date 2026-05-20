import { forwardRef, memo, useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'
import TextLayer from './TextLayer'
import ImageLayer from './ImageLayer'

const StageMeta = memo(function StageMeta({ image, box, count }) {
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

StageMeta.propTypes = {
  image: PropTypes.shape({ w: PropTypes.number.isRequired, h: PropTypes.number.isRequired }).isRequired,
  box: PropTypes.shape({ w: PropTypes.number.isRequired }).isRequired,
  count: PropTypes.number.isRequired,
}

const Stage = forwardRef(function Stage(
  { image, layers, selectedId, setSelectedId, updateLayer },
  ref
) {
  const innerRef = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  const handleSelect = useCallback((id) => setSelectedId(id), [setSelectedId])
  const handleUpdate = useCallback((id, patch) => updateLayer(id, patch), [updateLayer])

  useEffect(() => {
    if (innerRef.current) {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }
      )
    }
  }, [])

  useEffect(() => {
    const el = innerRef.current?.parentElement
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
        role="presentation"
        className="stage"
        ref={(el) => { innerRef.current = el; if (ref) ref.current = el }}
        style={{ width: box.w, height: box.h }}
        onMouseDown={(e) => { if (e.target.classList.contains('stage')) setSelectedId(null) }}
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

Stage.propTypes = {
  image: PropTypes.shape({ src: PropTypes.string.isRequired, w: PropTypes.number.isRequired, h: PropTypes.number.isRequired }).isRequired,
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedId: PropTypes.string,
  setSelectedId: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
}

export default Stage
