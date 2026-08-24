import { FONTS } from '../constants'
import type { MemeImage, Layer, ImageLayerData, TextLayerData } from '../types'

export function triggerDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function renderToBlob(image: MemeImage, layers: Layer[], scale = 2): Promise<Blob> {
  await document.fonts.ready
  const img = await loadImg(image.src)
  const W = image.w * scale
  const H = image.h * scale
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, W, H)
  for (const layer of layers) {
    if (layer.type === 'image') {
      await drawImageLayer(ctx, layer, W, H)
    } else {
      drawText(ctx, layer, W, H)
    }
  }
  drawWatermark(ctx, W, H)
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  )
}

export function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const LOGO_FONT = '"Anton", "Impact", "Haettenschweiler", sans-serif'
  const LIME = '#C8F02C'
  const INK = '#0E0E0E'

  const fontPx = Math.max(9, Math.min(W, H) * 0.022)
  const markSize = fontPx * 1.5
  const gap = fontPx * 0.4
  const pad = fontPx * 1.1

  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.font = `${fontPx}px ${LOGO_FONT}`
  ctx.letterSpacing = '1px'
  const word = 'EMEFORGE'
  const wordW = ctx.measureText(word).width

  const totalW = markSize + gap + wordW
  const rightX = W - pad
  const baseY = H - pad
  const startX = rightX - totalW
  const markCenterX = startX + markSize / 2
  const markCenterY = baseY - fontPx * 0.4

  ctx.save()
  ctx.translate(markCenterX, markCenterY)
  ctx.rotate((-3 * Math.PI) / 180)
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = markSize * 0.15
  ctx.fillStyle = LIME
  ctx.fillRect(-markSize / 2, -markSize / 2, markSize, markSize)
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = markSize * 0.12
  ctx.strokeStyle = INK
  ctx.strokeRect(-markSize / 2, -markSize / 2, markSize, markSize)
  ctx.fillStyle = INK
  ctx.font = `${fontPx * 0.85}px ${LOGO_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('M', 0, markSize * 0.04)
  ctx.restore()

  ctx.font = `${fontPx}px ${LOGO_FONT}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.lineWidth = fontPx * 0.22
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineJoin = 'round'
  ctx.strokeText(word, startX + markSize + gap, baseY)
  ctx.fillStyle = INK
  ctx.fillText(word, startX + markSize + gap, baseY)

  ctx.restore()
}

export async function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayerData,
  W: number,
  H: number
): Promise<void> {
  const img = await loadImg(layer.src)
  const pxW = layer.w * W
  const pxH = pxW / layer.aspectRatio
  ctx.save()
  ctx.translate(layer.x * W, layer.y * H)
  ctx.rotate((layer.rotation * Math.PI) / 180)
  ctx.drawImage(img, -pxW / 2, -pxH / 2, pxW, pxH)
  ctx.restore()
}

export function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function drawText(ctx: CanvasRenderingContext2D, t: TextLayerData, W: number, H: number): void {
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
