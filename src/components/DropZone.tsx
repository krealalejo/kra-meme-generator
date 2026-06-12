import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { SAMPLE_IMAGES } from '../utils/text'

interface DropZoneProps {
  onPickFile: () => void
  onSample: (src: string) => void
}

function FloatingStickers() {
  const stickers = [
    { txt: 'mastodonts', c: 'var(--lime)', x: '8%', y: '12%', r: -8 },
    { txt: 'pepe', c: 'var(--pink)', x: '85%', y: '18%', r: 12 },
    { txt: 'lol', c: 'var(--blue)', x: '12%', y: '82%', r: 6 },
    { txt: 'no cap', c: 'var(--lime)', x: '82%', y: '78%', r: -10 },
  ]
  return (
    <div className="floaters" aria-hidden="true">
      {stickers.map((s) => (
        <div
          key={s.txt}
          className="floater impact-preview"
          style={{ left: s.x, top: s.y, background: s.c, color: s.c === 'var(--lime)' ? '#0E0E0E' : 'white', transform: `rotate(${s.r}deg)` }}
        >
          {s.txt}
        </div>
      ))}
    </div>
  )
}

export default function DropZone({ onPickFile, onSample }: Readonly<DropZoneProps>) {
  const [hover, setHover] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* v8 ignore next -- dropRef is always attached when the effect runs */
    if (dropRef.current) {
      gsap.fromTo(dropRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }
      )
    }
  }, [])

  const handleSampleClick = (e: React.MouseEvent<HTMLButtonElement>, src: string) => {
    e.stopPropagation()
    const chip = e.currentTarget
    gsap.timeline()
      .to(chip, { scale: 0.88, duration: 0.07, ease: 'power2.in' })
      .to(chip, { scale: 1.12, duration: 0.13, ease: 'back.out(3)' })
      .to(chip, { scale: 1, duration: 0.09 })
    onSample(src)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      ref={dropRef}
      className={'drop ' + (hover ? 'is-hover' : '')}
      onDragEnter={() => setHover(true)}
      onDragLeave={() => setHover(false)}
      onDrop={() => setHover(false)}
      onClick={onPickFile}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPickFile() } }}
    >
      <div className="drop-inner">
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
                onClick={(e) => handleSampleClick(e, s.src)}
              >
                <img src={s.thumb} alt="" width="60" height="60" />
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
