export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

export function mkText(opts = {}) {
  return {
    id: crypto.randomUUID(),
    text: 'TEXT',
    x: 0.5,
    y: 0.5,
    size: 0.1,
    rotation: 0,
    font: 'impact',
    weight: 700,
    color: '#FFFFFF',
    stroke: 0.45,
    strokeColor: '#0E0E0E',
    tracking: 0.02,
    uppercase: true,
    shadow: false,
    ...opts,
  }
}

export function makeSamplePlaceholder(bg, line1, line2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <defs>
      <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="${bg}"/>
        <circle cx="20" cy="20" r="2" fill="rgba(0,0,0,0.12)"/>
      </pattern>
    </defs>
    <rect width="600" height="600" fill="url(#p)"/>
    <g font-family="JetBrains Mono, monospace" text-anchor="middle" fill="rgba(0,0,0,0.45)">
      <text x="300" y="295" font-size="32" font-weight="700">${line1}</text>
      <text x="300" y="335" font-size="20">${line2}</text>
      <text x="300" y="565" font-size="14">[ placeholder — drop your image ]</text>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

export const SAMPLE_IMAGES = [
  { label: 'DOGE', src: makeSamplePlaceholder('#F4D272', 'VERY MEME', 'such test') },
  { label: 'GUY', src: makeSamplePlaceholder('#9AD6E8', 'POV', 'you are a guy') },
  { label: 'CAT', src: makeSamplePlaceholder('#E3A8C9', 'ME LOOKING', 'at the fridge') },
]
