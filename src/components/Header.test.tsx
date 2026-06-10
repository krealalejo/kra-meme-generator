import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

const defaults = {
  hasImage: false,
  onUpload: vi.fn(),
  onDownload: vi.fn(),
  onCopy: vi.fn(),
  generating: false,
  theme: 'light',
  onToggleTheme: vi.fn(),
  isMobile: false,
  onReset: vi.fn(),
}

describe('Header', () => {
  it('renders MEMEFORGE logo', () => {
    render(<Header {...defaults} />)
    expect(screen.getByText((_, el) => el?.className === 'logo' && el?.textContent === 'MEMEFORGE')).toBeInTheDocument()
  })

  it('shows UPLOAD when no image', () => {
    render(<Header {...defaults} />)
    expect(screen.getByText(/UPLOAD/)).toBeInTheDocument()
  })

  it('shows REPLACE when image present', () => {
    render(<Header {...defaults} hasImage={true} />)
    expect(screen.getByText(/REPLACE/)).toBeInTheDocument()
  })

  it('download button disabled when no image', () => {
    render(<Header {...defaults} />)
    expect(screen.getByRole('button', { name: /DOWNLOAD/i })).toBeDisabled()
  })

  it('download button enabled when image present', () => {
    render(<Header {...defaults} hasImage={true} />)
    expect(screen.getByRole('button', { name: /DOWNLOAD/i })).not.toBeDisabled()
  })

  it('copy button disabled when no image', () => {
    render(<Header {...defaults} />)
    expect(screen.getByRole('button', { name: /COPY/i })).toBeDisabled()
  })

  it('copy button enabled when image present', () => {
    render(<Header {...defaults} hasImage={true} />)
    expect(screen.getByRole('button', { name: /COPY/i })).not.toBeDisabled()
  })

  it('shows GENERATING on all action buttons when busy', () => {
    render(<Header {...defaults} hasImage={true} generating={true} />)
    expect(screen.getAllByText(/GENERATING/)).toHaveLength(2)
  })

  it('calls onUpload when upload button clicked', () => {
    const onUpload = vi.fn()
    render(<Header {...defaults} onUpload={onUpload} />)
    fireEvent.click(screen.getByText(/UPLOAD/))
    expect(onUpload).toHaveBeenCalledOnce()
  })

  it('calls onDownload when download button clicked', () => {
    const onDownload = vi.fn()
    render(<Header {...defaults} hasImage={true} onDownload={onDownload} />)
    fireEvent.click(screen.getByRole('button', { name: /DOWNLOAD/i }))
    expect(onDownload).toHaveBeenCalledOnce()
  })

  it('calls onCopy when copy button clicked', () => {
    const onCopy = vi.fn()
    render(<Header {...defaults} hasImage={true} onCopy={onCopy} />)
    fireEvent.click(screen.getByRole('button', { name: /COPY/i }))
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('shows moon icon in light theme', () => {
    render(<Header {...defaults} theme="light" />)
    expect(screen.getByText('☾')).toBeInTheDocument()
  })

  it('shows sun icon in dark theme', () => {
    render(<Header {...defaults} theme="dark" />)
    expect(screen.getByText('☀')).toBeInTheDocument()
  })

  it('calls onToggleTheme when theme button clicked', () => {
    const onToggleTheme = vi.fn()
    render(<Header {...defaults} onToggleTheme={onToggleTheme} />)
    fireEvent.click(screen.getByText('☾'))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('logo not clickable when no image', () => {
    render(<Header {...defaults} />)
    const logo = screen.getByText((_, el) => el?.className === 'logo' && el?.textContent === 'MEMEFORGE')
    expect(logo).not.toHaveAttribute('title')
  })

  it('logo clickable when image present', () => {
    render(<Header {...defaults} hasImage={true} />)
    const logo = screen.getByText((_, el) => el?.className === 'logo' && el?.textContent === 'MEMEFORGE')
    expect(logo).toHaveAttribute('title', 'Back to home')
  })

  it('calls onReset when logo clicked with image', () => {
    const onReset = vi.fn()
    render(<Header {...defaults} hasImage={true} onReset={onReset} />)
    fireEvent.click(screen.getByText((_, el) => el?.className === 'logo' && el?.textContent === 'MEMEFORGE'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
