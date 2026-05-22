import { useRef } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'
import { FONTS, PRESET_COLORS, STROKE_COLORS } from '../constants'

Row.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

function Row({ label, children }) {
  return (
    <div className="ed-row">
      <span className="ed-label mono">{label}</span>
      <div className="ed-control">{children}</div>
    </div>
  )
}

Swatches.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

function Swatches({ colors, value, onChange }) {
  return (
    <div className="swatches">
      {colors.map((c) => (
        <button
          key={c}
          className={'swatch ' + (c === value ? 'is-on' : '')}
          style={{ background: c }}
          onClick={() => onChange(c)}
          title={c}
        />
      ))}
      <label className="swatch swatch-custom" title="custom">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <span>+</span>
      </label>
    </div>
  )
}

export default function TextEditor({ t, onUpdate, onDuplicate, onDelete }) {
  const editorRef = useRef(null)

  const handleDelete = () => {
    gsap.to(editorRef.current, {
      x: -12, opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete: onDelete,
    })
  }

  return (
    <div className="editor" ref={editorRef}>
      <textarea
        className="ed-text"
        value={t.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        rows={2}
        placeholder="type something dumb"
      />

      <Row label="FONT">
        <div className="seg">
          {FONTS.map((f) => (
            <button
              key={f.id}
              className={'seg-btn ' + (t.font === f.id ? 'is-on' : '')}
              onClick={() => onUpdate({ font: f.id })}
              style={{ fontFamily: f.css }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Row>

      <Row label="SIZE">
        <input
          type="range" min="0.02" max="0.4" step="0.005" value={t.size}
          onChange={(e) => onUpdate({ size: Number.parseFloat(e.target.value) })}
        />
        <span className="mono val">{Math.round(t.size * 100)}</span>
      </Row>

      <Row label="ROTATE">
        <input
          type="range" min="-45" max="45" step="1" value={t.rotation}
          onChange={(e) => onUpdate({ rotation: Number.parseInt(e.target.value) })}
        />
        <span className="mono val">{t.rotation}°</span>
      </Row>

      <Row label="STROKE">
        <input
          type="range" min="0" max="1" step="0.05" value={t.stroke}
          onChange={(e) => onUpdate({ stroke: Number.parseFloat(e.target.value) })}
        />
        <span className="mono val">{t.stroke.toFixed(2)}</span>
      </Row>

      <Row label="TRACK">
        <input
          type="range" min="-0.05" max="0.25" step="0.005" value={t.tracking}
          onChange={(e) => onUpdate({ tracking: Number.parseFloat(e.target.value) })}
        />
        <span className="mono val">{t.tracking.toFixed(2)}</span>
      </Row>

      <Row label="FILL">
        <Swatches colors={PRESET_COLORS} value={t.color} onChange={(c) => onUpdate({ color: c })} />
      </Row>

      <Row label="EDGE">
        <Swatches colors={STROKE_COLORS} value={t.strokeColor} onChange={(c) => onUpdate({ strokeColor: c })} />
      </Row>

      <Row label="STYLE">
        <button
          className={'toggle ' + (t.uppercase ? 'is-on' : '')}
          onClick={() => onUpdate({ uppercase: !t.uppercase })}
        >
          UPPER
        </button>
        <button
          className={'toggle ' + (t.weight >= 700 ? 'is-on' : '')}
          onClick={() => onUpdate({ weight: t.weight >= 700 ? 500 : 800 })}
        >
          BOLD
        </button>
        <button
          className={'toggle ' + (t.shadow ? 'is-on' : '')}
          onClick={() => onUpdate({ shadow: !t.shadow })}
        >
          SHADOW
        </button>
      </Row>

      <div className="ed-actions">
        <button className="mini-btn" onClick={onDuplicate}>duplicate</button>
        <button className="mini-btn danger" onClick={handleDelete}>delete</button>
      </div>
    </div>
  )
}

const textLayerShape = PropTypes.shape({
  text: PropTypes.string,
  font: PropTypes.string,
  size: PropTypes.number,
  rotation: PropTypes.number,
  stroke: PropTypes.number,
  tracking: PropTypes.number,
  color: PropTypes.string,
  strokeColor: PropTypes.string,
  uppercase: PropTypes.bool,
  weight: PropTypes.number,
  shadow: PropTypes.bool,
})

TextEditor.propTypes = {
  t: textLayerShape.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
