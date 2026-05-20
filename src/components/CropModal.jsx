import { useRef, useState } from 'react'
import PropTypes from 'prop-types'

export default function CropModal({ layer, onSave, onClose }) {
  const imgRef = useRef(null)
  const areaRef = useRef(null)
  const dragging = useRef(false)
  const startPt = useRef(null)

  const [mode, setMode] = useState('rect')
  const [drawing, setDrawing] = useState(false)
  const [cropRect, setCropRect] = useState(null)
  const [lassoPoints, setLassoPoints] = useState(null)

  const getAreaPt = (e) => {
    const r = areaRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const ptsToRect = (a, b) => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  })

  const isInImg = (pt) => {
    const ar = areaRef.current.getBoundingClientRect()
    const ir = imgRef.current.getBoundingClientRect()
    const ix = ir.left - ar.left
    const iy = ir.top - ar.top
    return pt.x >= ix && pt.x <= ix + ir.width && pt.y >= iy && pt.y <= iy + ir.height
  }

  const clampToImg = (pt) => {
    const ar = areaRef.current.getBoundingClientRect()
    const ir = imgRef.current.getBoundingClientRect()
    const ix = ir.left - ar.left
    const iy = ir.top - ar.top
    return {
      x: Math.max(ix, Math.min(ix + ir.width, pt.x)),
      y: Math.max(iy, Math.min(iy + ir.height, pt.y)),
    }
  }

  const onPointerDown = (e) => {
    const pt = getAreaPt(e)
    if (!isInImg(pt)) return
    e.preventDefault()
    dragging.current = true
    areaRef.current.setPointerCapture(e.pointerId)
    if (mode === 'rect') {
      startPt.current = pt
      setCropRect({ x: pt.x, y: pt.y, w: 0, h: 0 })
    } else {
      setDrawing(true)
      setLassoPoints([pt])
    }
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const pt = clampToImg(getAreaPt(e))
    if (mode === 'rect') {
      setCropRect(ptsToRect(startPt.current, pt))
    } else {
      setLassoPoints((prev) => [...prev, pt])
    }
  }

  const onPointerUp = () => {
    dragging.current = false
    setDrawing(false)
  }

  const switchMode = (m) => {
    setMode(m)
    setCropRect(null)
    setLassoPoints(null)
    setDrawing(false)
  }

  const handleSave = () => {
    if (mode === 'rect') saveRect()
    else saveLasso()
  }

  const saveRect = () => {
    if (!cropRect || cropRect.w < 5 || cropRect.h < 5) { onClose(); return }
    const img = imgRef.current
    const ar = areaRef.current.getBoundingClientRect()
    const ir = img.getBoundingClientRect()
    const ix = ir.left - ar.left
    const iy = ir.top - ar.top
    const scaleX = img.naturalWidth / ir.width
    const scaleY = img.naturalHeight / ir.height
    const sx = (cropRect.x - ix) * scaleX
    const sy = (cropRect.y - iy) * scaleY
    const sw = cropRect.w * scaleX
    const sh = cropRect.h * scaleY
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    onSave(canvas.toDataURL('image/png'), sw / sh)
  }

  const saveLasso = () => {
    if (!lassoPoints || lassoPoints.length < 3) { onClose(); return }
    const img = imgRef.current
    const ar = areaRef.current.getBoundingClientRect()
    const ir = img.getBoundingClientRect()
    const ix = ir.left - ar.left
    const iy = ir.top - ar.top
    const scaleX = img.naturalWidth / ir.width
    const scaleY = img.naturalHeight / ir.height

    const imgPts = lassoPoints.map((p) => ({
      x: (p.x - ix) * scaleX,
      y: (p.y - iy) * scaleY,
    }))

    const minX = Math.max(0, Math.min(...imgPts.map((p) => p.x)))
    const minY = Math.max(0, Math.min(...imgPts.map((p) => p.y)))
    const maxX = Math.min(img.naturalWidth, Math.max(...imgPts.map((p) => p.x)))
    const maxY = Math.min(img.naturalHeight, Math.max(...imgPts.map((p) => p.y)))
    const w = Math.round(maxX - minX)
    const h = Math.round(maxY - minY)
    if (w < 5 || h < 5) { onClose(); return }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    imgPts.forEach((p, i) => {
      const px = p.x - minX
      const py = p.y - minY
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, -minX, -minY)
    onSave(canvas.toDataURL('image/png'), w / h)
  }

  function cropHint(m, isDrawing, validCrop) {
    if (m === 'rect') return 'drag to select area'
    if (isDrawing) return 'keep drawing · release to finish'
    if (validCrop) return 'shape ready · hit save or draw again'
    return 'draw around the area to crop'
  }

  const hasValidCrop = mode === 'rect'
    ? cropRect && cropRect.w >= 5 && cropRect.h >= 5
    : lassoPoints && lassoPoints.length >= 3

  const lassoStr = lassoPoints ? lassoPoints.map((p) => `${p.x},${p.y}`).join(' ') : ''

  return (
    <div className="crop-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }} role="presentation">
      <div className="crop-modal">
        <div className="crop-modal-hdr">
          <div className="crop-modal-hdr-left">
            <span className="crop-modal-title mono">CROP</span>
            <div className="crop-mode-tabs">
              <button
                className={'crop-mode-tab mono ' + (mode === 'rect' ? 'is-on' : '')}
                onClick={() => switchMode('rect')}
              >
                □ RECT
              </button>
              <button
                className={'crop-mode-tab mono ' + (mode === 'draw' ? 'is-on' : '')}
                onClick={() => switchMode('draw')}
              >
                ✏ DRAW
              </button>
            </div>
          </div>
          <div className="crop-modal-actions">
            <button className="mini-btn" onClick={onClose}>discard</button>
            <button className="mini-btn crop-save-btn" onClick={handleSave} disabled={!hasValidCrop}>save</button>
          </div>
        </div>

        <div
          ref={areaRef}
          className={'crop-area ' + (mode === 'draw' ? 'crop-area-draw' : '')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img ref={imgRef} src={layer.src} alt="" draggable={false} className="crop-img" />

          {mode === 'rect' && hasValidCrop && (
            <div
              className="crop-sel"
              style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h }}
            />
          )}

          {mode === 'draw' && lassoPoints && lassoPoints.length > 1 && (
            <svg className="crop-lasso-svg">
              {drawing ? (
                <polyline points={lassoStr} fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round" />
              ) : (
                <polygon points={lassoStr} fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round" />
              )}
            </svg>
          )}
        </div>

        <div className="crop-hint mono">
          {cropHint(mode, drawing, hasValidCrop)}
        </div>
      </div>
    </div>
  )
}

CropModal.propTypes = {
  layer: PropTypes.shape({ src: PropTypes.string.isRequired }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
