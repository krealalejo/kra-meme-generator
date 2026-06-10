interface HeaderProps {
  hasImage: boolean
  onUpload: () => void
  onDownload: () => void
  generating: boolean
  theme: string
  onToggleTheme: () => void
  isMobile: boolean
  onReset: () => void
}

export default function Header({ hasImage, onUpload, onDownload, generating, theme, onToggleTheme, isMobile, onReset }: HeaderProps) {
  let uploadLabel
  if (isMobile) {
    uploadLabel = hasImage ? 'NEW' : 'PICK'
  } else {
    uploadLabel = hasImage ? 'REPLACE' : 'UPLOAD'
  }

  return (
    <header className="hdr">
      <div className="hdr-left">
        <div
          className="logo"
          onClick={hasImage ? onReset : undefined}
          style={hasImage ? { cursor: 'pointer' } : undefined}
          title={hasImage ? 'Back to home' : undefined}
        >
          <span className="logo-mark">M</span>
          <span className="logo-word">EMEFORGE</span>
        </div>
      </div>
      <div className="hdr-right">
        <button className="btn btn-ghost theme-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="btn btn-ghost" onClick={onUpload}>
          <span>↑</span> {uploadLabel}
        </button>
        {!isMobile && (
          <button
            className={'btn btn-primary ' + (generating ? 'is-busy' : '')}
            onClick={onDownload}
            disabled={!hasImage || generating}
          >
            {generating ? 'GENERATING…' : 'DOWNLOAD ↓'}
          </button>
        )}
      </div>
    </header>
  )
}
