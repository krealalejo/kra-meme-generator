import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DropZone from './DropZone'

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    timeline: vi.fn(() => { const t = {}; t.to = vi.fn(() => t); return t }),
  },
}))

describe('DropZone', () => {
  it('renders drop prompt', () => {
    render(<DropZone onPickFile={vi.fn()} onSample={vi.fn()} />)
    expect(screen.getByText(/drop an image/i)).toBeInTheDocument()
  })

  it('renders sample chips', () => {
    render(<DropZone onPickFile={vi.fn()} onSample={vi.fn()} />)
    expect(screen.getByText('PEPE MAGE')).toBeInTheDocument()
    expect(screen.getByText('PEPE SAD')).toBeInTheDocument()
    expect(screen.getByText('PEPE')).toBeInTheDocument()
  })

  it('calls onPickFile when drop zone clicked', () => {
    const onPickFile = vi.fn()
    render(<DropZone onPickFile={onPickFile} onSample={vi.fn()} />)
    fireEvent.click(document.querySelector('.drop'))
    expect(onPickFile).toHaveBeenCalledOnce()
  })

  it('adds is-hover class on drag enter', () => {
    render(<DropZone onPickFile={vi.fn()} onSample={vi.fn()} />)
    const drop = document.querySelector('.drop')
    fireEvent.dragEnter(drop)
    expect(drop).toHaveClass('is-hover')
  })

  it('removes is-hover class on drag leave', () => {
    render(<DropZone onPickFile={vi.fn()} onSample={vi.fn()} />)
    const drop = document.querySelector('.drop')
    fireEvent.dragEnter(drop)
    fireEvent.dragLeave(drop)
    expect(drop).not.toHaveClass('is-hover')
  })

  it('removes is-hover class on drop', () => {
    render(<DropZone onPickFile={vi.fn()} onSample={vi.fn()} />)
    const drop = document.querySelector('.drop')
    fireEvent.dragEnter(drop)
    fireEvent.drop(drop)
    expect(drop).not.toHaveClass('is-hover')
  })

  it('calls onSample when chip clicked', () => {
    const onSample = vi.fn()
    render(<DropZone onPickFile={vi.fn()} onSample={onSample} />)
    fireEvent.click(screen.getByText('PEPE'))
    expect(onSample).toHaveBeenCalledOnce()
  })

  it('calls onPickFile when Enter pressed on drop zone', () => {
    const onPickFile = vi.fn()
    render(<DropZone onPickFile={onPickFile} onSample={vi.fn()} />)
    fireEvent.keyDown(document.querySelector('.drop'), { key: 'Enter' })
    expect(onPickFile).toHaveBeenCalledOnce()
  })

  it('calls onPickFile when Space pressed on drop zone', () => {
    const onPickFile = vi.fn()
    render(<DropZone onPickFile={onPickFile} onSample={vi.fn()} />)
    fireEvent.keyDown(document.querySelector('.drop'), { key: ' ' })
    expect(onPickFile).toHaveBeenCalledOnce()
  })

  it('ignores other keys on drop zone', () => {
    const onPickFile = vi.fn()
    render(<DropZone onPickFile={onPickFile} onSample={vi.fn()} />)
    fireEvent.keyDown(document.querySelector('.drop'), { key: 'a' })
    expect(onPickFile).not.toHaveBeenCalled()
  })
})
