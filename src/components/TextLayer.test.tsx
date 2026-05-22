import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TextLayer from './TextLayer'
import { mkText } from '../utils/text'

function mkProps(overrides = {}) {
  return {
    t: mkText({ text: 'HELLO', x: 0.5, y: 0.1, size: 0.1, rotation: 0, uppercase: false }),
    box: { w: 600, h: 400 },
    selected: false,
    onSelect: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('TextLayer', () => {
  it('renders text content', () => {
    render(<TextLayer {...mkProps()} />)
    expect(screen.getByText('HELLO')).toBeInTheDocument()
  })

  it('shows ellipsis when text is empty', () => {
    const props = mkProps()
    props.t = { ...props.t, text: '' }
    render(<TextLayer {...props} />)
    expect(screen.getByText('…')).toBeInTheDocument()
  })

  it('does not show resize handle when not selected', () => {
    render(<TextLayer {...mkProps({ selected: false })} />)
    expect(document.querySelector('.handle-resize')).not.toBeInTheDocument()
  })

  it('shows resize handle when selected', () => {
    render(<TextLayer {...mkProps({ selected: true })} />)
    expect(document.querySelector('.handle-resize')).toBeInTheDocument()
  })

  it('has is-selected class when selected', () => {
    render(<TextLayer {...mkProps({ selected: true })} />)
    expect(document.querySelector('.layer')).toHaveClass('is-selected')
  })

  it('does not have is-selected class when not selected', () => {
    render(<TextLayer {...mkProps({ selected: false })} />)
    expect(document.querySelector('.layer')).not.toHaveClass('is-selected')
  })

  it('calls onSelect on pointerDown', () => {
    const onSelect = vi.fn()
    render(<TextLayer {...mkProps({ onSelect })} />)
    fireEvent.pointerDown(document.querySelector('.layer'), { clientX: 100, clientY: 100 })
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('calls onUpdate on pointer drag', () => {
    const onUpdate = vi.fn()
    render(<TextLayer {...mkProps({ onUpdate })} />)
    const layer = document.querySelector('.layer')
    fireEvent.pointerDown(layer, { clientX: 300, clientY: 200 })
    fireEvent.pointerMove(window, { clientX: 360, clientY: 240 })
    fireEvent.pointerUp(window)
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
  })

  it('clamps drag position to [0, 1]', () => {
    const onUpdate = vi.fn()
    render(<TextLayer {...mkProps({ onUpdate })} />)
    const layer = document.querySelector('.layer')
    fireEvent.pointerDown(layer, { clientX: 300, clientY: 200 })
    fireEvent.pointerMove(window, { clientX: 9999, clientY: 9999 })
    fireEvent.pointerUp(window)
    const { x, y } = onUpdate.mock.calls.at(-1)[1]
    expect(x).toBeLessThanOrEqual(1)
    expect(y).toBeLessThanOrEqual(1)
  })

  it('resize handle pointerDown calls onSelect and onUpdate on drag', () => {
    const onUpdate = vi.fn()
    const onSelect = vi.fn()
    render(<TextLayer {...mkProps({ selected: true, onSelect, onUpdate })} />)
    const handle = document.querySelector('.handle-resize')
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(window, { clientX: 100, clientY: 160 })
    fireEvent.pointerUp(window)
    expect(onSelect).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ size: expect.any(Number) }))
  })

  it('skips drag update if pointerDown target has data-role=handle', () => {
    const onUpdate = vi.fn()
    render(<TextLayer {...mkProps({ selected: true, onUpdate })} />)
    const handle = document.querySelector('.handle-resize')
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(window, { clientX: 200, clientY: 100 })
    fireEvent.pointerUp(window)
    expect(onUpdate).not.toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ x: expect.any(Number) }))
  })

  it('opens prompt on double click and updates text', () => {
    const onUpdate = vi.fn()
    window.prompt = vi.fn(() => 'NEW TEXT')
    render(<TextLayer {...mkProps({ onUpdate })} />)
    fireEvent.dblClick(document.querySelector('.layer'))
    expect(onUpdate).toHaveBeenCalledWith(expect.any(String), { text: 'NEW TEXT' })
    delete window.prompt
  })

  it('does not update if prompt is cancelled', () => {
    const onUpdate = vi.fn()
    window.prompt = vi.fn(() => null)
    render(<TextLayer {...mkProps({ onUpdate })} />)
    fireEvent.dblClick(document.querySelector('.layer'))
    expect(onUpdate).not.toHaveBeenCalled()
    delete window.prompt
  })
})
