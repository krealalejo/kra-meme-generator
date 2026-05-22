import { useState } from 'react'
import PropTypes from 'prop-types'
import CropModal from './CropModal'

export default function ImageEditor({ layer, onUpdate, onDuplicate, onDelete }) {
  const [cropping, setCropping] = useState(false)

  return (
    <div className="editor">
      <div className="ed-row">
        <span className="ed-label">ROTATE</span>
        <div className="ed-control">
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={layer.rotation}
            onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
          />
          <span className="val mono">{layer.rotation}°</span>
        </div>
      </div>

      <div className="ed-actions">
        <button className="mini-btn" onClick={() => setCropping(true)}>crop</button>
        <button className="mini-btn" onClick={onDuplicate}>duplicate</button>
        <button className="mini-btn danger" onClick={onDelete}>delete</button>
      </div>

      {cropping && (
        <CropModal
          layer={layer}
          onSave={(src, aspectRatio) => {
            onUpdate({ src, aspectRatio })
            setCropping(false)
          }}
          onClose={() => setCropping(false)}
        />
      )}
    </div>
  )
}

ImageEditor.propTypes = {
  layer: PropTypes.shape({ rotation: PropTypes.number.isRequired }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
