export default function Header({ hasImage, onUpload, onDownload, generating }) {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="logo">
          <span className="logo-mark">M</span>
          <span className="logo-word">MEMEFORGE</span>
        </div>
        <div className="tagline mono">v0.1 / certified meme operations</div>
      </div>
      <div className="hdr-right">
        <button className="btn btn-ghost" onClick={onUpload}>
          <span>↑</span> {hasImage ? 'REPLACE' : 'UPLOAD'}
        </button>
        <button
          className={'btn btn-primary ' + (generating ? 'is-busy' : '')}
          onClick={onDownload}
          disabled={!hasImage || generating}
        >
          {generating ? 'GENERATING…' : 'DOWNLOAD .PNG ↓'}
        </button>
      </div>
    </header>
  )
}
