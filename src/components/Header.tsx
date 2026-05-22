interface HeaderProps {
  hasImage: boolean
  onUpload: () => void
  onDownload: () => void
  generating: boolean
  theme: string
  onToggleTheme: () => void
  isMobile: boolean
}

export default function Header({ hasImage, onUpload, onDownload, generating, theme, onToggleTheme, isMobile }: HeaderProps) {
  let uploadLabel
  if (isMobile) {
    uploadLabel = hasImage ? 'NEW' : 'PICK'
  } else {
    uploadLabel = hasImage ? 'REPLACE' : 'UPLOAD'
  }

  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="logo">
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
