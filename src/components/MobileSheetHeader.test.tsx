import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileSheetHeader from './MobileSheetHeader'

function mkProps(overrides = {}) {
  return {
    tab: 'layers',
    setTab: vi.fn(),
    open: false,
    setOpen: vi.fn(),
    counts: { hasImage: false, layers: 0, hasSel: false },
    ...overrides,
  }
}

beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    left: 0, top: 0, right: 375, bottom: 200, width: 375, height: 200,
  }))
  Element.prototype.setPointerCapture = vi.fn()
})

describe('MobileSheetHeader', () => {
  it('renders IMAGE, LAYERS, EDIT tabs', () => {
    render(<MobileSheetHeader {...mkProps()} />)
    expect(screen.getByText('IMAGE')).toBeInTheDocument()
    expect(screen.getByText('LAYERS')).toBeInTheDocument()
    expect(screen.getByText('EDIT')).toBeInTheDocument()
  })

  it('active tab with open=true has is-on class', () => {
    render(<MobileSheetHeader {...mkProps({ tab: 'layers', open: true })} />)
    expect(screen.getByText('LAYERS').closest('button')).toHaveClass('is-on')
  })

  it('active tab with open=false does not have is-on class', () => {
    render(<MobileSheetHeader {...mkProps({ tab: 'layers', open: false })} />)
    expect(screen.getByText('LAYERS').closest('button')).not.toHaveClass('is-on')
  })

  it('clicking inactive tab calls setTab and setOpen(true)', () => {
    const setTab = vi.fn()
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ tab: 'layers', open: true, setTab, setOpen })} />)
    fireEvent.click(screen.getByText('IMAGE').closest('button'))
    expect(setTab).toHaveBeenCalledWith('image')
    expect(setOpen).toHaveBeenCalledWith(true)
  })

  it('clicking active open tab calls setOpen(false)', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ tab: 'layers', open: true, setOpen })} />)
    fireEvent.click(screen.getByText('LAYERS').closest('button'))
    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('shows layer count badge when layers > 0', () => {
    render(<MobileSheetHeader {...mkProps({ counts: { hasImage: false, layers: 3, hasSel: false } })} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('no dot badge on IMAGE when hasImage', () => {
    render(<MobileSheetHeader {...mkProps({ counts: { hasImage: true, layers: 0, hasSel: false } })} />)
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })

  it('no dot badge on EDIT when hasSel', () => {
    render(<MobileSheetHeader {...mkProps({ counts: { hasImage: false, layers: 0, hasSel: true } })} />)
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })

  it('grab bar aria-label changes with open state', () => {
    const { rerender } = render(<MobileSheetHeader {...mkProps({ open: false })} />)
    expect(screen.getByRole('button', { name: /open panel/i })).toBeInTheDocument()
    rerender(<MobileSheetHeader {...mkProps({ open: true })} />)
    expect(screen.getByRole('button', { name: /close panel/i })).toBeInTheDocument()
  })

  it('pointerDown on grab sets dragging', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ setOpen })} />)
    const grab = screen.getByRole('button', { name: /open panel/i })
    fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })

    fireEvent(window, new PointerEvent('pointerup', { clientY: 50 }))
    expect(setOpen).toHaveBeenCalledWith(true)
  })

  it('dragging down calls setOpen(false)', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ setOpen })} />)
    const grab = screen.getByRole('button', { name: /open panel/i })
    fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
    fireEvent(window, new PointerEvent('pointerup', { clientY: 130 }))
    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('tap (small delta) toggles open state', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ open: false, setOpen })} />)
    const grab = screen.getByRole('button', { name: /open panel/i })
    fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
    fireEvent(window, new PointerEvent('pointerup', { clientY: 102 }))

    expect(setOpen).toHaveBeenCalled()
  })

  it('tap toggle passes a function updater that flips open state', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ open: false, setOpen })} />)
    const grab = screen.getByRole('button', { name: /open panel/i })
    fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
    fireEvent(window, new PointerEvent('pointerup', { clientY: 102 }))

    const updater = setOpen.mock.calls.at(-1)[0]
    expect(typeof updater).toBe('function')
    expect(updater(false)).toBe(true)
    expect(updater(true)).toBe(false)
  })

  it('pointermove while dragging does not throw', () => {
    render(<MobileSheetHeader {...mkProps()} />)
    const grab = screen.getByRole('button', { name: /open panel/i })
    fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
    expect(() => {
      fireEvent(window, new PointerEvent('pointermove', { clientY: 80 }))
    }).not.toThrow()
    fireEvent(window, new PointerEvent('pointerup', { clientY: 80 }))
  })

  it('pointermove without prior pointerdown is a no-op', () => {
    render(<MobileSheetHeader {...mkProps()} />)
    expect(() => {
      fireEvent(window, new PointerEvent('pointermove', { clientY: 80 }))
    }).not.toThrow()
  })

  it('pointerup without prior pointerdown is a no-op', () => {
    const setOpen = vi.fn()
    render(<MobileSheetHeader {...mkProps({ setOpen })} />)
    fireEvent(window, new PointerEvent('pointerup', { clientY: 80 }))
    expect(setOpen).not.toHaveBeenCalled()
  })

  describe('with .side ancestor', () => {
    function renderInSide(props = {}) {
      const side = document.createElement('div')
      side.className = 'side'
      document.body.appendChild(side)
      return render(<MobileSheetHeader {...mkProps(props)} />, { container: side })
    }

    it('sets max-height on .side while dragging up', () => {
      renderInSide()
      const grab = screen.getByRole('button', { name: /open panel/i })
      const side = document.querySelector('.side')
      fireEvent.pointerDown(grab, { clientY: 200, pointerId: 1 })
      expect(side.style.transition).toBe('none')
      fireEvent(window, new PointerEvent('pointermove', { clientY: 150 }))
      expect(side.style.maxHeight).toBe('250px')
      fireEvent(window, new PointerEvent('pointerup', { clientY: 150 }))
      expect(side.style.maxHeight).toBe('')
    })

    it('clamps max-height to 52px minimum when dragging far down', () => {
      renderInSide()
      const grab = screen.getByRole('button', { name: /open panel/i })
      const side = document.querySelector('.side')
      fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
      fireEvent(window, new PointerEvent('pointermove', { clientY: 9999 }))
      expect(side.style.maxHeight).toBe('52px')
      fireEvent(window, new PointerEvent('pointerup', { clientY: 9999 }))
    })

    it('prevents touchmove scroll while dragging', () => {
      renderInSide()
      const grab = screen.getByRole('button', { name: /open panel/i })
      fireEvent.pointerDown(grab, { clientY: 100, pointerId: 1 })
      const evt = new Event('touchmove', { cancelable: true })
      globalThis.dispatchEvent(evt)
      expect(evt.defaultPrevented).toBe(true)
      fireEvent(window, new PointerEvent('pointerup', { clientY: 100 }))
    })

    it('does not prevent touchmove when not dragging', () => {
      renderInSide()
      const evt = new Event('touchmove', { cancelable: true })
      globalThis.dispatchEvent(evt)
      expect(evt.defaultPrevented).toBe(false)
    })
  })
})
