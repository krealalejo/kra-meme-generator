import { FONTS } from '../constants'

export function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function renderToBlob(image, texts) {
  const img = await loadImg(image.src)
  const canvas = document.createElement('canvas')
  canvas.width = image.w
  canvas.height = image.h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, image.w, image.h)
  for (const t of texts) {
    drawText(ctx, t, image.w, image.h)
  }
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function drawText(ctx, t, W, H) {
  const fontDef = FONTS.find((f) => f.id === t.font) || FONTS[0]
  const sizePx = Math.max(8, t.size * H)
  const text = t.uppercase ? (t.text || '').toUpperCase() : t.text || ''
  ctx.save()
  ctx.translate(t.x * W, t.y * H)
  ctx.rotate((t.rotation * Math.PI) / 180)
  ctx.font = `${t.weight} ${sizePx}px ${fontDef.css}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lines = text.split('\n')
  const lineHeight = sizePx * 1.05
  const totalH = lineHeight * lines.length
  const strokePx = t.stroke * sizePx * 0.18

  if (t.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = sizePx * 0.18
    ctx.shadowOffsetY = sizePx * 0.06
  }

  lines.forEach((line, i) => {
    const y = -totalH / 2 + lineHeight * (i + 0.5)
    if (strokePx > 0) {
      ctx.lineWidth = strokePx
      ctx.strokeStyle = t.strokeColor
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText(line, 0, y)
    }
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = t.color
    ctx.fillText(line, 0, y)
  })

  ctx.restore()
}
