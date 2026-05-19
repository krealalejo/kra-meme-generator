import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders MEMEFORGE logo', () => {
    render(<Header hasImage={false} onUpload={vi.fn()} onDownload={vi.fn()} generating={false} />)
    expect(screen.getByText('MEMEFORGE')).toBeInTheDocument()
  })

  it('shows UPLOAD when no image', () => {
    render(<Header hasImage={false} onUpload={vi.fn()} onDownload={vi.fn()} generating={false} />)
    expect(screen.getByText(/UPLOAD/)).toBeInTheDocument()
  })

  it('shows REPLACE when image present', () => {
    render(<Header hasImage={true} onUpload={vi.fn()} onDownload={vi.fn()} generating={false} />)
    expect(screen.getByText(/REPLACE/)).toBeInTheDocument()
  })

  it('download button disabled when no image', () => {
    render(<Header hasImage={false} onUpload={vi.fn()} onDownload={vi.fn()} generating={false} />)
    const btn = screen.getByText(/DOWNLOAD/)
    expect(btn).toBeDisabled()
  })

  it('download button enabled when image present', () => {
    render(<Header hasImage={true} onUpload={vi.fn()} onDownload={vi.fn()} generating={false} />)
    const btn = screen.getByText(/DOWNLOAD/)
    expect(btn).not.toBeDisabled()
  })

  it('shows GENERATING when busy', () => {
    render(<Header hasImage={true} onUpload={vi.fn()} onDownload={vi.fn()} generating={true} />)
    expect(screen.getByText(/GENERATING/)).toBeInTheDocument()
  })

  it('calls onUpload when upload button clicked', () => {
    const onUpload = vi.fn()
    render(<Header hasImage={false} onUpload={onUpload} onDownload={vi.fn()} generating={false} />)
    fireEvent.click(screen.getByText(/UPLOAD/))
    expect(onUpload).toHaveBeenCalledOnce()
  })

  it('calls onDownload when download button clicked', () => {
    const onDownload = vi.fn()
    render(<Header hasImage={true} onUpload={vi.fn()} onDownload={onDownload} generating={false} />)
    fireEvent.click(screen.getByText(/DOWNLOAD/))
    expect(onDownload).toHaveBeenCalledOnce()
  })
})
