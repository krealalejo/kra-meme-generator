import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileFab from './MobileFab'

const defaultProps = { generating: false, onDownload: vi.fn(), onCopy: vi.fn() }

describe('MobileFab', () => {
  it('renders download button', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toBeInTheDocument()
  })

  it('renders copy button', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /copy meme to clipboard/i })).toBeInTheDocument()
  })

  it('shows PNG label on download button when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByText('↓ PNG')).toBeInTheDocument()
  })

  it('shows copy symbol on copy button when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByText('⧉')).toBeInTheDocument()
  })

  it('shows busy indicator on both buttons when generating', () => {
    render(<MobileFab {...defaultProps} generating={true} />)
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('download button disabled when generating', () => {
    render(<MobileFab {...defaultProps} generating={true} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toBeDisabled()
  })

  it('copy button disabled when generating', () => {
    render(<MobileFab {...defaultProps} generating={true} />)
    expect(screen.getByRole('button', { name: /copy meme to clipboard/i })).toBeDisabled()
  })

  it('download button enabled when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download meme/i })).not.toBeDisabled()
  })

  it('copy button enabled when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /copy meme to clipboard/i })).not.toBeDisabled()
  })

  it('calls onDownload when download button clicked', () => {
    const onDownload = vi.fn()
    render(<MobileFab {...defaultProps} onDownload={onDownload} />)
    fireEvent.click(screen.getByRole('button', { name: /download meme/i }))
    expect(onDownload).toHaveBeenCalledOnce()
  })

  it('calls onCopy when copy button clicked', () => {
    const onCopy = vi.fn()
    render(<MobileFab {...defaultProps} onCopy={onCopy} />)
    fireEvent.click(screen.getByRole('button', { name: /copy meme to clipboard/i }))
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('download button has is-busy class when generating', () => {
    render(<MobileFab {...defaultProps} generating={true} />)
    expect(screen.getByRole('button', { name: /download meme/i })).toHaveClass('is-busy')
  })

  it('copy button has is-busy class when generating', () => {
    render(<MobileFab {...defaultProps} generating={true} />)
    expect(screen.getByRole('button', { name: /copy meme to clipboard/i })).toHaveClass('is-busy')
  })

  it('download button does not have is-busy class when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download meme/i })).not.toHaveClass('is-busy')
  })

  it('copy button does not have is-busy class when not generating', () => {
    render(<MobileFab {...defaultProps} />)
    expect(screen.getByRole('button', { name: /copy meme to clipboard/i })).not.toHaveClass('is-busy')
  })
})
