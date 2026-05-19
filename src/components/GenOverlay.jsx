export default function GenOverlay() {
  return (
    <div id="gen-overlay" className="gen-overlay" style={{ visibility: 'hidden', opacity: 0 }}>
      <div className="gen-stamp stamp impact-preview" style={{ top: '18%', left: '12%' }}>FORGED</div>
      <div className="gen-stamp stamp impact-preview alt" style={{ top: '22%', right: '10%' }}>100% MEME</div>
      <div className="gen-stamp stamp impact-preview blue" style={{ bottom: '22%', left: '16%' }}>RENDERING</div>
      <div className="gen-stamp stamp impact-preview pink" style={{ bottom: '18%', right: '14%' }}>SAVE IT</div>

      <div className="gen-center">
        <div className="glitch impact-preview">GENERATING</div>
        <div className="gen-bar"><span className="bar" /></div>
        <div className="mono gen-sub">writing pixels · etching memes · forging dankness</div>
      </div>

      <div className="done impact-preview">SAVED ✓</div>
    </div>
  )
}
