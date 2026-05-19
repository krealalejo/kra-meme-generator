import { describe, it, expect, vi, beforeEach } from 'vitest'
import { drawText } from './canvas'

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
})
