import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileFab from './MobileFab'

describe('MobileFab', () => {
  it('renders download button', () => {
    render(<MobileFab generating={false} onDownload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toBeInTheDocument()
  })

  it('shows PNG label when not generating', () => {
    render(<MobileFab generating={false} onDownload={vi.fn()} />)
    expect(screen.getByText('↓ PNG')).toBeInTheDocument()
  })

  it('shows busy indicator when generating', () => {
    render(<MobileFab generating={true} onDownload={vi.fn()} />)
    expect(screen.getByText('…')).toBeInTheDocument()
  })

  it('button disabled when generating', () => {
    render(<MobileFab generating={true} onDownload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toBeDisabled()
  })

  it('button enabled when not generating', () => {
    render(<MobileFab generating={false} onDownload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download meme/i })).not.toBeDisabled()
  })

  it('calls onDownload when clicked', () => {
    const onDownload = vi.fn()
    render(<MobileFab generating={false} onDownload={onDownload} />)
    fireEvent.click(screen.getByRole('button', { name: /download meme/i }))
    expect(onDownload).toHaveBeenCalledOnce()
  })

  it('has is-busy class when generating', () => {
    render(<MobileFab generating={true} onDownload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toHaveClass('is-busy')
  })

  it('does not have is-busy class when not generating', () => {
    render(<MobileFab generating={false} onDownload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /download meme/i })).not.toHaveClass('is-busy')
  })
})
