import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

const defaults = { hasImage: false, onUpload: vi.fn(), onDownload: vi.fn(), generating: false, theme: 'light', onToggleTheme: vi.fn() }

describe('Header', () => {
  it('renders MEMEFORGE logo', () => {
    render(<Header {...defaults} />)
    expect(screen.getByText('MEMEFORGE')).toBeInTheDocument()
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
    const btn = screen.getByText(/DOWNLOAD/)
    expect(btn).toBeDisabled()
  })

  it('download button enabled when image present', () => {
    render(<Header {...defaults} hasImage={true} />)
    const btn = screen.getByText(/DOWNLOAD/)
    expect(btn).not.toBeDisabled()
  })

  it('shows GENERATING when busy', () => {
    render(<Header {...defaults} hasImage={true} generating={true} />)
    expect(screen.getByText(/GENERATING/)).toBeInTheDocument()
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
    fireEvent.click(screen.getByText(/DOWNLOAD/))
    expect(onDownload).toHaveBeenCalledOnce()
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
})
