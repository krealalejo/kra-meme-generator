import { describe, it, expect } from 'vitest'
import { clamp, mkText, makeSamplePlaceholder } from './text'

describe('clamp', () => {
  it('returns value within range unchanged', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it('clamps to minimum', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
  })

  it('clamps to maximum', () => {
    expect(clamp(2, 0, 1)).toBe(1)
  })

  it('handles exact boundary values', () => {
    expect(clamp(0, 0, 1)).toBe(0)
    expect(clamp(1, 0, 1)).toBe(1)
  })
})

describe('mkText', () => {
  it('returns object with required fields', () => {
    const t = mkText()
    expect(t).toHaveProperty('id')
    expect(t).toHaveProperty('text')
    expect(t).toHaveProperty('x')
    expect(t).toHaveProperty('y')
    expect(t).toHaveProperty('size')
    expect(t).toHaveProperty('font')
    expect(t).toHaveProperty('color')
  })

  it('generates unique ids', () => {
    const a = mkText()
    const b = mkText()
    expect(a.id).not.toBe(b.id)
  })

  it('overrides defaults with opts', () => {
    const t = mkText({ text: 'HELLO', y: 0.9, size: 0.2 })
    expect(t.text).toBe('HELLO')
    expect(t.y).toBe(0.9)
    expect(t.size).toBe(0.2)
  })

  it('sets uppercase true by default', () => {
    expect(mkText().uppercase).toBe(true)
  })

  it('sets font to impact by default', () => {
    expect(mkText().font).toBe('impact')
  })

  it('sets white color by default', () => {
    expect(mkText().color).toBe('#FFFFFF')
  })
})

describe('makeSamplePlaceholder', () => {
  it('returns a data URI', () => {
    const result = makeSamplePlaceholder('#FF0000', 'LINE1', 'LINE2')
    expect(result).toMatch(/^data:image\/svg\+xml;charset=utf-8,/)
  })

  it('encodes background color into SVG', () => {
    const result = makeSamplePlaceholder('#FF0000', 'A', 'B')
    const decoded = decodeURIComponent(result.replace('data:image/svg+xml;charset=utf-8,', ''))
    expect(decoded).toContain('#FF0000')
  })

  it('encodes text lines into SVG', () => {
    const result = makeSamplePlaceholder('#000', 'VERY MEME', 'such test')
    const decoded = decodeURIComponent(result.replace('data:image/svg+xml;charset=utf-8,', ''))
    expect(decoded).toContain('VERY MEME')
    expect(decoded).toContain('such test')
  })
})
