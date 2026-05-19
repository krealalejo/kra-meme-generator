export default function Header({ hasImage, onUpload, onDownload, generating, theme, onToggleTheme, isMobile }) {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="logo">
          <span className="logo-mark">M</span>
          <span className="logo-word">MEMEFORGE</span>
        </div>
        {!isMobile && <div className="tagline mono">v0.1 / certified meme operations</div>}
      </div>
      <div className="hdr-right">
        <button className="btn btn-ghost theme-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="btn btn-ghost" onClick={onUpload}>
          <span>↑</span> {isMobile ? (hasImage ? 'NEW' : 'PICK') : (hasImage ? 'REPLACE' : 'UPLOAD')}
        </button>
        {!isMobile && (
          <button
            className={'btn btn-primary ' + (generating ? 'is-busy' : '')}
            onClick={onDownload}
            disabled={!hasImage || generating}
          >
            {generating ? 'GENERATING…' : 'DOWNLOAD .PNG ↓'}
          </button>
        )}
      </div>
    </header>
  )
}
