import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import TextEditor from './TextEditor'
import ImageEditor from './ImageEditor'
import type { MemeImage, Layer, LayerPatch } from '../types'

interface PanelBlockProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

function PanelBlock({ title, subtitle, action, children }: PanelBlockProps) {
  return (
    <section className="block">
      <header className="block-hdr">
        <div className="block-titles">
          <h3 className="block-title">{title}</h3>
          {subtitle && <span className="block-sub mono">{subtitle}</span>}
        </div>
        {action}
      </header>
      <div className="block-body">{children}</div>
    </section>
  )
}

interface SidePanelProps {
  image: MemeImage | null
  layers: Layer[]
  selected: Layer | undefined
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  addText: () => void
  addImageLayer: () => void
  updateLayer: (id: string, patch: LayerPatch) => void
  removeLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  reorderLayers: (from: number, to: number) => void
  onReplaceImage: () => void
  onClearImage: () => void
  isMobile: boolean
  mobileTab: string
}

export default function SidePanel({
  image, layers, selected, selectedId, setSelectedId,
  addText, addImageLayer, updateLayer, removeLayer, duplicateLayer, reorderLayers,
  onReplaceImage, onClearImage,
  isMobile, mobileTab,
}: SidePanelProps) {
  const dragSrc = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const show = (key: string) => isMobile ? mobileTab === key : true
  return (
    <div className="panel">
      {show('image') && (
        <PanelBlock title="IMAGE" subtitle="source">
          {image ? (
            <div className="img-meta">
              <div className="img-thumb">
                <img src={image.src} alt="" />
              </div>
              <div className="img-info mono">
                <div>{image.w}×{image.h}</div>
                <div className="row-btns">
                  <button className="mini-btn" onClick={onReplaceImage}>replace</button>
                  <button className="mini-btn danger" onClick={onClearImage}>remove</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty mono">no image loaded</div>
          )}
        </PanelBlock>
      )}

      {show('layers') && (
        <PanelBlock
          title="LAYERS"
          subtitle={`${layers.length} ${layers.length === 1 ? 'item' : 'items'}`}
          action={
            <div className="add-btns">
              <button className="add-btn" onClick={addText}>
                <span>T</span> TEXT
              </button>
              <button className="add-btn" onClick={addImageLayer}>
                <span>⊞</span> IMG
              </button>
            </div>
          }
        >
          {layers.length === 0 ? (
            <div className="empty mono">no layers yet. hit + to add one</div>
          ) : (
            <div className="layer-list">
              {layers.map((l, idx) => (
                <div
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  className={[
                    'layer-row',
                    l.id === selectedId ? 'is-active' : '',
                    dragOver === idx ? 'is-drag-over' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedId(l.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(l.id) }}
                  onDragStart={(e) => {
                    dragSrc.current = idx
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDragOver(idx)
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(null)
                    if (dragSrc.current !== null) reorderLayers(dragSrc.current, idx)
                    dragSrc.current = null
                  }}
                  onDragEnd={() => { dragSrc.current = null; setDragOver(null) }}
                  aria-selected={l.id === selectedId}
                >
                  <span className="layer-row-drag" aria-hidden>⠿</span>
                  <span className="layer-row-idx mono">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="layer-row-type mono">{l.type === 'image' ? 'IMG' : 'TXT'}</span>
                  <span className="layer-row-text">
                    {l.type === 'image' ? '[image]' : (l.text || '(empty)')}
                  </span>
                  <button
                    type="button"
                    className="layer-row-x"
                    onClick={(e) => {
                      e.stopPropagation()
                      const row = e.currentTarget.closest('.layer-row')
                      gsap.to(row, {
                        x: -16, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0,
                        duration: 0.18, ease: 'power2.in',
                        onComplete: () => removeLayer(l.id),
                      })
                    }}
                    title="delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </PanelBlock>
      )}

      {show('edit') && (selected ? (
        <PanelBlock
          title="EDIT"
          subtitle={`layer ${layers.findIndex((l) => l.id === selected.id) + 1}`}
        >
          {selected.type === 'image' ? (
            <ImageEditor
              layer={selected}
              onUpdate={(patch) => updateLayer(selected.id, patch)}
              onDuplicate={() => duplicateLayer(selected.id)}
              onDelete={() => removeLayer(selected.id)}
            />
          ) : (
            <TextEditor
              t={selected}
              onUpdate={(patch) => updateLayer(selected.id, patch)}
              onDuplicate={() => duplicateLayer(selected.id)}
              onDelete={() => removeLayer(selected.id)}
            />
          )}
        </PanelBlock>
      ) : (
        <PanelBlock title="EDIT" subtitle="nothing selected">
          <div className="empty mono">
            tap a layer above or on the canvas to edit
            <br /><br />
            <span style={{ opacity: 0.7 }}>tip: ctrl+v to paste an image as overlay</span>
          </div>
        </PanelBlock>
      ))}
    </div>
  )
}
