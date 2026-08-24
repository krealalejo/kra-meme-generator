import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageLayer from './ImageLayer'
import { mkImageLayer } from '../utils/text'

function mkProps(overrides = {}) {
  return {
    layer: mkImageLayer({ src: 'sticker.png', x: 0.5, y: 0.5, w: 0.3, aspectRatio: 1.5, rotation: 0 }),
    box: { w: 600, h: 400 },
    selected: false,
    onSelect: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('ImageLayer', () => {
  it('renders image with src', () => {
    render(<ImageLayer {...mkProps()} />)
    expect(document.querySelector('.layer-img img')).toHaveAttribute('src', 'sticker.png')
  })

  it('does not show resize handle when not selected', () => {
    render(<ImageLayer {...mkProps({ selected: false })} />)
    expect(document.querySelector('.handle-resize')).not.toBeInTheDocument()
  })

  it('shows resize handle when selected', () => {
    render(<ImageLayer {...mkProps({ selected: true })} />)
    expect(document.querySelector('.handle-resize')).toBeInTheDocument()
  })

  it('has is-selected class when selected', () => {
    render(<ImageLayer {...mkProps({ selected: true })} />)
    expect(document.querySelector('.layer-img')).toHaveClass('is-selected')
  })

  it('does not have is-selected class when not selected', () => {
    render(<ImageLayer {...mkProps({ selected: false })} />)
    expect(document.querySelector('.layer-img')).not.toHaveClass('is-selected')
  })

  it('calls onSelect on pointerDown', () => {
    const onSelect = vi.fn()
    render(<ImageLayer {...mkProps({ onSelect })} />)
    fireEvent.pointerDown(document.querySelector('.layer-img'), { clientX: 100, clientY: 100 })
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('calls onUpdate with new position on drag', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ onUpdate })} />)
    const layer = document.querySelector('.layer-img')
    fireEvent.pointerDown(layer, { clientX: 300, clientY: 200 })
    fireEvent.pointerMove(window, { clientX: 360, clientY: 240 })
    fireEvent.pointerUp(window)
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
  })

  it('clamps dragged position to [0, 1]', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ onUpdate })} />)
    const layer = document.querySelector('.layer-img')
    fireEvent.pointerDown(layer, { clientX: 300, clientY: 200 })
    fireEvent.pointerMove(window, { clientX: -9999, clientY: -9999 })
    fireEvent.pointerUp(window)
    const { x, y } = onUpdate.mock.calls.at(-1)[1]
    expect(x).toBeGreaterThanOrEqual(0)
    expect(y).toBeGreaterThanOrEqual(0)
  })

  it('resize handle pointerDown updates width on drag', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ selected: true, onUpdate })} />)
    const handle = document.querySelector('.handle-resize')
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(window, { clientX: 160, clientY: 100 })
    fireEvent.pointerUp(window)
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ w: expect.any(Number) }))
  })

  it('skips position drag when pointerDown originates on the resize handle', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ selected: true, onUpdate })} />)
    const handle = document.querySelector('.handle-resize')
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(window, { clientX: 100, clientY: 200 })
    fireEvent.pointerUp(window)
    expect(onUpdate).not.toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ x: expect.any(Number) }))
  })

  it('does not show rotate handle when not selected', () => {
    render(<ImageLayer {...mkProps({ selected: false })} />)
    expect(document.querySelector('.handle-rotate')).not.toBeInTheDocument()
  })

  it('shows rotate handle when selected', () => {
    render(<ImageLayer {...mkProps({ selected: true })} />)
    expect(document.querySelector('.handle-rotate')).toBeInTheDocument()
  })

  it('rotate handle pointerDown updates rotation on drag', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ selected: true, onUpdate })} />)
    const handle = document.querySelector('.handle-rotate')
    fireEvent.pointerDown(handle, { clientX: 0, clientY: -50 })
    fireEvent.pointerMove(window, { clientX: 50, clientY: 0 })
    fireEvent.pointerUp(window)
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ rotation: expect.any(Number) }))
  })

  it('skips position drag when pointerDown originates on the rotate handle', () => {
    const onUpdate = vi.fn()
    render(<ImageLayer {...mkProps({ selected: true, onUpdate })} />)
    const handle = document.querySelector('.handle-rotate')
    fireEvent.pointerDown(handle, { clientX: 0, clientY: -50 })
    fireEvent.pointerMove(window, { clientX: 100, clientY: -50 })
    fireEvent.pointerUp(window)
    expect(onUpdate).not.toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ x: expect.any(Number) }))
  })

  it('sets position style from layer x/y', () => {
    const layer = mkImageLayer({ src: 'test.png', x: 0.25, y: 0.75, w: 0.2, aspectRatio: 1, rotation: 0 })
    render(<ImageLayer {...mkProps({ layer })} />)
    const el = document.querySelector('.layer-img')
    expect(el.style.left).toBe('25%')
    expect(el.style.top).toBe('75%')
  })

  it('applies rotation via transform', () => {
    const layer = mkImageLayer({ src: 'test.png', rotation: 45 })
    render(<ImageLayer {...mkProps({ layer })} />)
    expect(document.querySelector('.layer-img').style.transform).toContain('rotate(45deg)')
  })
})
