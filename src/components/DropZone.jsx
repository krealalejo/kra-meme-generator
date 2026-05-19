import { useState } from 'react'
import { SAMPLE_IMAGES } from '../utils/text'

function FloatingStickers() {
  const stickers = [
    { txt: 'lol', c: 'var(--lime)', x: '8%', y: '12%', r: -8 },
    { txt: '100', c: 'var(--pink)', x: '85%', y: '18%', r: 12 },
    { txt: 'fr', c: 'var(--blue)', x: '12%', y: '82%', r: 6 },
    { txt: 'no cap', c: 'var(--lime)', x: '82%', y: '78%', r: -10 },
  ]
  return (
    <div className="floaters" aria-hidden="true">
      {stickers.map((s, i) => (
        <div
          key={i}
          className="floater impact-preview"
          style={{ left: s.x, top: s.y, background: s.c, transform: `rotate(${s.r}deg)` }}
        >
          {s.txt}
        </div>
      ))}
    </div>
  )
}

export default function DropZone({ onPickFile, onSample }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className={'drop ' + (hover ? 'is-hover' : '')}
      onDragEnter={() => setHover(true)}
      onDragLeave={() => setHover(false)}
      onDrop={() => setHover(false)}
      onClick={onPickFile}
    >
      <div className="drop-inner">
        <div className="drop-badge mono">STEP 01</div>
        <h1 className="drop-title">
          drop an image
          <br />
          <span className="alt">or click to upload</span>
        </h1>
        <div className="drop-sub mono">
          jpg · png · gif · webp · whatever your phone caught yesterday
        </div>

        <div className="samples">
          <div className="samples-label mono">no image? try a placeholder →</div>
          <div className="samples-row">
            {SAMPLE_IMAGES.map((s) => (
              <button
                key={s.label}
                className="sample-chip"
                onClick={(e) => { e.stopPropagation(); onSample(s.src) }}
              >
                <img src={s.src} alt="" />
                <span className="mono">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <FloatingStickers />
    </div>
  )
}
