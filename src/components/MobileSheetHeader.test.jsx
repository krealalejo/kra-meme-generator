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
    // drag up (negative delta) → should trigger setOpen(true) on pointerup
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
    // small delta → toggles: setOpen called with a function
    expect(setOpen).toHaveBeenCalled()
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
})
