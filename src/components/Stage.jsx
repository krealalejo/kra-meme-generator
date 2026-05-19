import { forwardRef, useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import TextLayer from './TextLayer'

function StageMeta({ image, box, count }) {
  return (
    <div className="stage-meta mono">
      <span>{image.w}×{image.h}px</span>
      <span className="dot">•</span>
      <span>{count} {count === 1 ? 'layer' : 'layers'}</span>
      <span className="dot">•</span>
      <span>scale {box.w ? Math.round((box.w / image.w) * 100) : 0}%</span>
    </div>
  )
}

const Stage = forwardRef(function Stage(
  { image, texts, selectedId, setSelectedId, updateText },
  ref
) {
  const innerRef = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

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
        className="stage"
        ref={(el) => { innerRef.current = el; if (ref) ref.current = el }}
        style={{ width: box.w, height: box.h }}
        onMouseDown={(e) => { if (e.target.classList.contains('stage')) setSelectedId(null) }}
      >
        <img className="stage-img" src={image.src} alt="" draggable={false} />
        {texts.map((t) => (
          <TextLayer
            key={t.id}
            t={t}
            box={box}
            selected={t.id === selectedId}
            onSelect={() => setSelectedId(t.id)}
            onUpdate={(patch) => updateText(t.id, patch)}
          />
        ))}
      </div>
      <StageMeta image={image} box={box} count={texts.length} />
    </div>
  )
})

export default Stage
