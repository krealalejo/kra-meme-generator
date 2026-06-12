import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CropModal from './CropModal'
import { mkImageLayer } from '../utils/text'

const layer = mkImageLayer({ src: 'img.png' })

function mkProps(overrides = {}) {
  return {
    layer,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    left: 0, top: 0, right: 600, bottom: 400, width: 600, height: 400,
  }))
})

describe('CropModal', () => {
  it('renders CROP title', () => {
    render(<CropModal {...mkProps()} />)
    expect(screen.getByText('CROP')).toBeInTheDocument()
  })

  it('shows RECT and DRAW mode tabs', () => {
    render(<CropModal {...mkProps()} />)
    expect(screen.getByText(/RECT/)).toBeInTheDocument()
    expect(screen.getByText(/DRAW/)).toBeInTheDocument()
  })

  it('RECT tab has is-on class by default', () => {
    render(<CropModal {...mkProps()} />)
    expect(screen.getByText(/RECT/)).toHaveClass('is-on')
  })

  it('switches to DRAW mode on tab click', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    expect(screen.getByText(/DRAW/)).toHaveClass('is-on')
    expect(screen.getByText(/RECT/)).not.toHaveClass('is-on')
  })

  it('switches back to RECT mode', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    fireEvent.click(screen.getByText(/RECT/))
    expect(screen.getByText(/RECT/)).toHaveClass('is-on')
  })

  it('calls onClose on discard click', () => {
    const onClose = vi.fn()
    render(<CropModal {...mkProps({ onClose })} />)
    fireEvent.click(screen.getByText('discard'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('save button is disabled when no valid crop', () => {
    render(<CropModal {...mkProps()} />)
    expect(screen.getByText('save')).toBeDisabled()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    render(<CropModal {...mkProps({ onClose })} />)
    const backdrop = document.querySelector('.crop-backdrop')
    fireEvent.pointerDown(backdrop, { target: backdrop })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows rect mode hint text', () => {
    render(<CropModal {...mkProps()} />)
    expect(screen.getByText(/drag to select area/i)).toBeInTheDocument()
  })

  it('shows draw mode hint text after switching', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    expect(screen.getByText(/draw around/i)).toBeInTheDocument()
  })

  it('ignores pointerDown outside the image area', () => {
    render(<CropModal {...mkProps()} />)
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 9999, clientY: 9999, pointerId: 1 })
    expect(screen.getByText('save')).toBeDisabled()
  })

  it('ignores pointerMove when not dragging', () => {
    render(<CropModal {...mkProps()} />)
    const area = document.querySelector('.crop-area')
    fireEvent.pointerMove(area, { clientX: 150, clientY: 150 })
    expect(screen.getByText('save')).toBeDisabled()
  })

  it('lasso with too-small bounding box closes without saving', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { get: () => 600, configurable: true })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', { get: () => 400, configurable: true })
    render(<CropModal {...mkProps({ onSave, onClose })} />)
    fireEvent.click(screen.getByText(/DRAW/))
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 101, clientY: 100 })
    fireEvent.pointerMove(area, { clientX: 100, clientY: 101 })
    fireEvent.pointerUp(area)
    fireEvent.click(screen.getByText('save'))
    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('draws lasso points in draw mode', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 150, clientY: 150 })
    fireEvent.pointerMove(area, { clientX: 200, clientY: 100 })
    fireEvent.pointerUp(area)
    expect(document.querySelector('.crop-lasso-svg')).toBeInTheDocument()
  })

  it('shows keeping drawing hint while drawing', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 150, clientY: 150 })
    expect(screen.getByText(/keep drawing/i)).toBeInTheDocument()
    fireEvent.pointerUp(area)
  })

  it('draws rect crop and enables save button', () => {
    render(<CropModal {...mkProps()} />)
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 50, clientY: 50, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 250, clientY: 200 })
    expect(screen.getByText('save')).not.toBeDisabled()
  })

  it('saveRect calls onSave with dataURL when valid crop', () => {
    const onSave = vi.fn()
    const toDataURL = vi.fn(() => 'data:image/png;base64,abc')
    const ctx2d = { drawImage: vi.fn() }
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { get: () => 600, configurable: true })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', { get: () => 400, configurable: true })
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return { width: 0, height: 0, getContext: () => ctx2d, toDataURL }
      return origCreate(tag)
    })
    render(<CropModal {...mkProps({ onSave })} />)
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 50, clientY: 50, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 250, clientY: 200 })
    fireEvent.pointerUp(area)
    fireEvent.click(screen.getByText('save'))
    expect(onSave).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('saveLasso calls onSave with sufficient lasso points', () => {
    const onSave = vi.fn()
    const toDataURL = vi.fn(() => 'data:image/png;base64,abc')
    const ctx2d = {
      beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      closePath: vi.fn(), clip: vi.fn(), drawImage: vi.fn(),
    }
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { get: () => 600, configurable: true })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', { get: () => 400, configurable: true })
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return { width: 0, height: 0, getContext: () => ctx2d, toDataURL }
      return origCreate(tag)
    })
    render(<CropModal {...mkProps({ onSave })} />)
    fireEvent.click(screen.getByText(/DRAW/))
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 200, clientY: 100 })
    fireEvent.pointerMove(area, { clientX: 150, clientY: 200 })
    fireEvent.pointerMove(area, { clientX: 100, clientY: 150 })
    fireEvent.pointerUp(area)
    fireEvent.click(screen.getByText('save'))
    expect(onSave).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('shows shape ready hint after finishing lasso with enough points', () => {
    render(<CropModal {...mkProps()} />)
    fireEvent.click(screen.getByText(/DRAW/))
    const area = document.querySelector('.crop-area')
    fireEvent.pointerDown(area, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 200, clientY: 100 })
    fireEvent.pointerMove(area, { clientX: 150, clientY: 200 })
    fireEvent.pointerMove(area, { clientX: 100, clientY: 150 })
    fireEvent.pointerUp(area)
    expect(screen.getByText(/shape ready/i)).toBeInTheDocument()
  })
})
