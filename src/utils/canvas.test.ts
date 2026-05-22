import { describe, it, expect, vi, beforeEach } from 'vitest'
import { drawText, triggerDownload, loadImg, drawImageLayer, renderToBlob } from './canvas'

function makeCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    lineWidth: 0,
    strokeStyle: '',
    lineJoin: '',
    miterLimit: 0,
    fillStyle: '',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
  }
}

describe('drawText', () => {
  let ctx

  beforeEach(() => {
    ctx = makeCtx()
  })

  it('calls save and restore', () => {
    drawText(ctx, { id: '1', text: 'HI', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }, 600, 400)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })

  it('applies uppercase when flag is set', () => {
    const t = { id: '1', text: 'hello', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: true, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.fillText).toHaveBeenCalledWith('HELLO', 0, expect.any(Number))
  })

  it('does not uppercase when flag is false', () => {
    const t = { id: '1', text: 'hello', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.fillText).toHaveBeenCalledWith('hello', 0, expect.any(Number))
  })

  it('sets shadow when flag is true', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: true }
    drawText(ctx, t, 600, 400)
    expect(ctx.shadowColor).toBe('transparent')
  })

  it('translates to correct position', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.25, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.translate).toHaveBeenCalledWith(300, 100)
  })

  it('handles multiline text', () => {
    const t = { id: '1', text: 'line1\nline2', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.fillText).toHaveBeenCalledTimes(2)
  })

  it('calls strokeText when stroke > 0', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0.5, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.strokeText).toHaveBeenCalled()
  })

  it('skips strokeText when stroke is 0', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.strokeText).not.toHaveBeenCalled()
  })

  it('rotates canvas by rotation angle', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.5, size: 0.1, rotation: 90, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    drawText(ctx, t, 600, 400)
    expect(ctx.rotate).toHaveBeenCalledWith((90 * Math.PI) / 180)
  })

  it('uses fallback font when font id not found', () => {
    const t = { id: '1', text: 'A', x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'unknown-font', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    expect(() => drawText(ctx, t, 600, 400)).not.toThrow()
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('handles null text gracefully', () => {
    const t = { id: '1', text: null, x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: false, shadow: false }
    expect(() => drawText(ctx, t, 600, 400)).not.toThrow()
    expect(ctx.fillText).toHaveBeenCalledWith('', 0, expect.any(Number))
  })

  it('handles null text with uppercase flag', () => {
    const t = { id: '1', text: null, x: 0.5, y: 0.5, size: 0.1, rotation: 0, font: 'impact', weight: 700, color: '#fff', stroke: 0, strokeColor: '#000', tracking: 0, uppercase: true, shadow: false }
    expect(() => drawText(ctx, t, 600, 400)).not.toThrow()
    expect(ctx.fillText).toHaveBeenCalledWith('', 0, expect.any(Number))
  })
})

describe('triggerDownload', () => {
  it('creates anchor, sets href and download, then clicks', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url')
    const revokeObjectURL = vi.fn()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi.fn()
    const origCreate = document.createElement.bind(document)
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        const el = origCreate('a')
        el.click = clickSpy
        return el
      }
      return origCreate(tag)
    })

    const blob = new Blob(['data'], { type: 'image/png' })
    triggerDownload(blob, 'meme.png')

    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(clickSpy).toHaveBeenCalled()
    createSpy.mockRestore()
  })
})

describe('loadImg', () => {
  it('resolves with image on successful load', async () => {
    global.Image = class {
      constructor() { this.crossOrigin = '' }
      set src(_v) { if (this.onload) this.onload() }
    }
    const img = await loadImg('test.png')
    expect(img).toBeDefined()
  })

  it('rejects on image error', async () => {
    global.Image = class {
      constructor() { this.crossOrigin = '' }
      set src(_v) { if (this.onerror) this.onerror(new Error('not found')) }
    }
    await expect(loadImg('bad.png')).rejects.toBeDefined()
  })
})

describe('renderToBlob', () => {
  beforeEach(() => {
    global.Image = class {
      constructor() { this.crossOrigin = '' }
      set src(_v) { if (this.onload) this.onload() }
    }
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true,
    })
  })

  it('returns a Blob for image with text layers', async () => {
    const ctx2d = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: '',
      drawImage: vi.fn(),
      save: vi.fn(), restore: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(),
      fillText: vi.fn(), strokeText: vi.fn(),
      font: '', textAlign: '', textBaseline: '',
      lineWidth: 0, strokeStyle: '', lineJoin: '', miterLimit: 0,
      fillStyle: '', shadowColor: '', shadowBlur: 0, shadowOffsetY: 0,
    }
    const mockCanvas = {
      width: 0, height: 0,
      getContext: () => ctx2d,
      toBlob: (cb) => cb(new Blob(['png'], { type: 'image/png' })),
    }
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas
      return origCreate(tag)
    })
    const { mkText } = await import('../utils/text')
    const layer = mkText({ text: 'HELLO', y: 0.5 })
    const blob = await renderToBlob({ src: 'test.png', w: 600, h: 400 }, [layer])
    expect(blob).toBeInstanceOf(Blob)
    vi.restoreAllMocks()
  })

  it('handles image layers in renderToBlob', async () => {
    const ctx2d = {
      imageSmoothingEnabled: false, imageSmoothingQuality: '',
      drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(),
    }
    const mockCanvas = {
      width: 0, height: 0,
      getContext: () => ctx2d,
      toBlob: (cb) => cb(new Blob(['png'], { type: 'image/png' })),
    }
    const origCreate2 = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas
      return origCreate2(tag)
    })
    const { mkImageLayer } = await import('../utils/text')
    const layer = mkImageLayer({ src: 'sticker.png', x: 0.5, y: 0.5, w: 0.3, aspectRatio: 1 })
    const blob = await renderToBlob({ src: 'test.png', w: 600, h: 400 }, [layer])
    expect(blob).toBeInstanceOf(Blob)
    vi.restoreAllMocks()
  })
})

describe('drawImageLayer', () => {
  it('draws image at correct position and size', async () => {
    global.Image = class {
      constructor() { this.crossOrigin = '' }
      set src(_v) { if (this.onload) this.onload() }
    }
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
    }
    const layer = { src: 'sticker.png', x: 0.5, y: 0.5, w: 0.3, aspectRatio: 2, rotation: 0 }
    await drawImageLayer(ctx, layer, 600, 400)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.translate).toHaveBeenCalledWith(300, 200)
    expect(ctx.drawImage).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })

  it('applies rotation', async () => {
    global.Image = class {
      constructor() { this.crossOrigin = '' }
      set src(_v) { if (this.onload) this.onload() }
    }
    const ctx = {
      save: vi.fn(), restore: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), drawImage: vi.fn(),
    }
    const layer = { src: 'sticker.png', x: 0.5, y: 0.5, w: 0.3, aspectRatio: 1, rotation: 45 }
    await drawImageLayer(ctx, layer, 600, 400)
    expect(ctx.rotate).toHaveBeenCalledWith((45 * Math.PI) / 180)
  })
})
