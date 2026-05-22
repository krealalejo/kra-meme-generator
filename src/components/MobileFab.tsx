interface MobileFabProps {
  generating: boolean
  onDownload: () => void
}

export default function MobileFab({ generating, onDownload }: MobileFabProps) {
  return (
    <div className="fab-wrap">
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
