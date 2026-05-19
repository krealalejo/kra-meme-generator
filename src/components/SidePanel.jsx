import TextEditor from './TextEditor'

function PanelBlock({ title, subtitle, action, children }) {
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

export default function SidePanel({
  image, texts, selected, selectedId, setSelectedId,
  addText, updateText, removeText, duplicateText,
  onReplaceImage, onClearImage,
  isMobile, mobileTab,
}) {
  const show = (key) => !isMobile || mobileTab === key
  return (
    <div className="panel">
      {show('image') && (
        <PanelBlock title="IMAGE" subtitle="source">
          {!image ? (
            <div className="empty mono">no image loaded</div>
          ) : (
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
          )}
        </PanelBlock>
      )}

      {show('layers') && (
        <PanelBlock
          title="TEXT LAYERS"
          subtitle={`${texts.length} ${texts.length === 1 ? 'item' : 'items'}`}
          action={
            <button className="add-btn" onClick={addText}>
              <span>+</span> ADD TEXT
            </button>
          }
        >
          {texts.length === 0 ? (
            <div className="empty mono">no text yet. hit + to add one.</div>
          ) : (
            <div className="layer-list">
              {texts.map((t, idx) => (
                <button
                  key={t.id}
                  className={'layer-row ' + (t.id === selectedId ? 'is-active' : '')}
                  onClick={() => setSelectedId(t.id)}
                >
                  <span className="layer-row-idx mono">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="layer-row-text">{t.text || '(empty)'}</span>
                  <span
                    className="layer-row-x"
                    onClick={(e) => { e.stopPropagation(); removeText(t.id) }}
                    title="delete"
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </PanelBlock>
      )}

      {show('edit') && (selected ? (
        <PanelBlock
          title="EDIT"
          subtitle={`layer ${texts.findIndex((t) => t.id === selected.id) + 1}`}
        >
          <TextEditor
            t={selected}
            onUpdate={(patch) => updateText(selected.id, patch)}
            onDuplicate={() => duplicateText(selected.id)}
            onDelete={() => removeText(selected.id)}
          />
        </PanelBlock>
      ) : (
        <PanelBlock title="EDIT" subtitle="nothing selected">
          <div className="empty mono">
            tap a layer above or on the canvas to edit it.
            <br /><br />
            <span style={{ opacity: 0.7 }}>tip: double-tap a layer to retype it fast.</span>
          </div>
        </PanelBlock>
      ))}
    </div>
  )
}
