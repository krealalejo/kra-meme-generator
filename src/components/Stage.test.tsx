import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import Stage from './Stage'
import { mkText, mkImageLayer } from '../utils/text'
import { gsap } from 'gsap'

vi.mock('gsap', () => ({
  gsap: { fromTo: vi.fn() },
}))

vi.mock('./TextLayer', () => ({
  default: ({ t, selected, onSelect, onUpdate }) => (
    <div
      data-testid="text-layer"
      data-selected={String(selected)}
      onClick={() => onSelect(t.id)}
      onDoubleClick={() => onUpdate(t.id, { text: 'updated' })}
    >
      {t.text}
    </div>
  ),
}))

vi.mock('./ImageLayer', () => ({
  default: ({ layer, selected, onSelect }) => (
    <div
      data-testid="image-layer"
      data-selected={String(selected)}
      onClick={() => onSelect(layer.id)}
    >
      {layer.src}
    </div>
  ),
}))

let triggerResize
let rectSpy
let disconnectSpy

class MockResizeObserver {
  constructor(cb) {
    triggerResize = () => cb()
  }
  observe() {}
  disconnect() { disconnectSpy() }
}

function makeProps(overrides = {}) {
  return {
    image: { src: 'test.jpg', w: 800, h: 600 },
    layers: [],
    selectedId: null,
    setSelectedId: vi.fn(),
    updateLayer: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  triggerResize = null
  disconnectSpy = vi.fn()
  global.ResizeObserver = MockResizeObserver
  rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 1000, height: 1000 })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Stage', () => {
  it('renders the image', () => {
    const { container } = render(<Stage {...makeProps()} />)
    const img = container.querySelector('.stage-img')
    expect(img).toHaveAttribute('src', 'test.jpg')
  })

  it('calls gsap.fromTo on mount', () => {
    render(<Stage {...makeProps()} />)
    expect(gsap.fromTo).toHaveBeenCalledOnce()
  })

  it('renders text layers', () => {
    const layer = mkText({ text: 'HELLO' })
    render(<Stage {...makeProps({ layers: [layer] })} />)
    expect(screen.getByTestId('text-layer')).toBeInTheDocument()
    expect(screen.getByText('HELLO')).toBeInTheDocument()
  })

  it('renders image layers', () => {
    const layer = mkImageLayer({ src: 'overlay.png' })
    render(<Stage {...makeProps({ layers: [layer] })} />)
    expect(screen.getByTestId('image-layer')).toBeInTheDocument()
  })

  it('marks selected text layer', () => {
    const layer = mkText({ text: 'HI' })
    render(<Stage {...makeProps({ layers: [layer], selectedId: layer.id })} />)
    expect(screen.getByTestId('text-layer')).toHaveAttribute('data-selected', 'true')
  })

  it('marks unselected text layer', () => {
    const layer = mkText({ text: 'HI' })
    render(<Stage {...makeProps({ layers: [layer], selectedId: null })} />)
    expect(screen.getByTestId('text-layer')).toHaveAttribute('data-selected', 'false')
  })

  it('calls setSelectedId when text layer clicked', () => {
    const setSelectedId = vi.fn()
    const layer = mkText({ text: 'HI' })
    render(<Stage {...makeProps({ layers: [layer], setSelectedId })} />)
    fireEvent.click(screen.getByTestId('text-layer'))
    expect(setSelectedId).toHaveBeenCalledWith(layer.id)
  })

  it('calls updateLayer via handleUpdate', () => {
    const updateLayer = vi.fn()
    const layer = mkText({ text: 'X' })
    render(<Stage {...makeProps({ layers: [layer], updateLayer })} />)
    fireEvent.doubleClick(screen.getByTestId('text-layer'))
    expect(updateLayer).toHaveBeenCalledWith(layer.id, { text: 'updated' })
  })

  it('calls setSelectedId(null) when clicking stage background', () => {
    const setSelectedId = vi.fn()
    const { container } = render(<Stage {...makeProps({ setSelectedId })} />)
    const stageEl = container.querySelector('.stage')
    fireEvent.mouseDown(stageEl)
    expect(setSelectedId).toHaveBeenCalledWith(null)
  })

  it('does not call setSelectedId when clicking non-stage element', () => {
    const setSelectedId = vi.fn()
    const { container } = render(<Stage {...makeProps({ setSelectedId })} />)
    const img = container.querySelector('.stage-img')
    fireEvent.mouseDown(img)
    expect(setSelectedId).not.toHaveBeenCalled()
  })

  it('forwards ref to stage element', () => {
    const ref = createRef()
    render(<Stage {...makeProps()} ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current.classList.contains('stage')).toBe(true)
  })

  it('renders without a ref', () => {
    expect(() => render(<Stage {...makeProps()} />)).not.toThrow()
  })

  it('shows singular layer count', () => {
    render(<Stage {...makeProps({ layers: [mkText()] })} />)
    expect(screen.getByText('1 layer')).toBeInTheDocument()
  })

  it('shows plural layer count', () => {
    render(<Stage {...makeProps({ layers: [mkText(), mkText()] })} />)
    expect(screen.getByText('2 layers')).toBeInTheDocument()
  })

  it('shows 0% scale before resize', () => {
    render(<Stage {...makeProps()} />)
    expect(screen.getByText(/scale 0%/)).toBeInTheDocument()
  })

  it('ResizeObserver: normal case (h <= maxH)', () => {
    render(<Stage {...makeProps()} />)
    act(() => triggerResize())
    expect(screen.queryByText(/scale 0%/)).not.toBeInTheDocument()
    expect(screen.getByText(/scale \d+%/)).toBeInTheDocument()
  })

  it('ResizeObserver: tall case (h > maxH)', () => {
    rectSpy.mockReturnValue({ width: 1000, height: 100 })
    render(<Stage {...makeProps()} />)
    act(() => triggerResize())
    expect(screen.getByText(/scale \d+%/)).toBeInTheDocument()
  })

  it('ResizeObserver disconnects on unmount', () => {
    const { unmount } = render(<Stage {...makeProps()} />)
    unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })
})
