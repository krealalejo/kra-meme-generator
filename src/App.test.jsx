import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
  global.Image = class {
    constructor() {
      this.crossOrigin = ''
    }
    set src(value) {
      if (this.onload) this.onload()
    }
    get naturalWidth() { return 600 }
    get naturalHeight() { return 400 }
  }
})

describe('App', () => {
  it('renders drop zone initially', () => {
    render(<App />)
    expect(screen.getByText(/drop an image/i)).toBeInTheDocument()
  })

  it('renders MEMEFORGE header', () => {
    render(<App />)
    expect(screen.getByText('MEMEFORGE')).toBeInTheDocument()
  })

  it('shows no image loaded in panel initially', () => {
    render(<App />)
    expect(screen.getByText(/no image loaded/i)).toBeInTheDocument()
  })

  it('shows placeholder sample chips', () => {
    render(<App />)
    expect(screen.getByText('DOGE')).toBeInTheDocument()
    expect(screen.getByText('GUY')).toBeInTheDocument()
    expect(screen.getByText('CAT')).toBeInTheDocument()
  })

  it('loads image when sample chip clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('DOGE'))
    await waitFor(() => {
      expect(screen.queryByText(/drop an image/i)).not.toBeInTheDocument()
    })
  })

  it('shows toast when adding text without image', async () => {
    render(<App />)
    const addBtn = screen.getByText(/ADD TEXT/)
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByText(/upload an image first/i)).toBeInTheDocument()
    })
  })

  it('shows two default text layers after loading image', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('DOGE'))
    await waitFor(() => {
      expect(screen.getAllByText('TOP TEXT').length).toBeGreaterThan(0)
      expect(screen.getAllByText('BOTTOM TEXT').length).toBeGreaterThan(0)
    })
  })

  it('adds text layer when ADD TEXT clicked with image', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('DOGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    fireEvent.click(screen.getByText(/ADD TEXT/))
    await waitFor(() => {
      expect(screen.getAllByText(/NEW TEXT/).length).toBeGreaterThan(0)
    })
  })
})
