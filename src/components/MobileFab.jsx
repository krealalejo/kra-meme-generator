export default function MobileFab({ generating, onDownload }) {
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
