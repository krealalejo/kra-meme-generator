interface MobileFabProps {
  generating: boolean
  onDownload: () => void
  onCopy: () => void
}

export default function MobileFab({ generating, onDownload, onCopy }: Readonly<MobileFabProps>) {
  return (
    <div className="fab-wrap">
      <button
        className={'fab fab-dl ' + (generating ? 'is-busy' : '')}
        onClick={onCopy}
        disabled={generating}
        aria-label="copy meme to clipboard"
      >
        {generating ? '…' : '⧉'}
      </button>
      <button
        className={'fab fab-dl ' + (generating ? 'is-busy' : '')}
        onClick={onDownload}
        disabled={generating}
        aria-label="download meme"
      >
        {generating ? '…' : '↓ PNG'}
      </button>
    </div>
  )
}
