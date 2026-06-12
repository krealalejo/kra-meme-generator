import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import App from './App'
import { renderToBlob, triggerDownload } from './utils/canvas'
import useIsMobile from './hooks/useIsMobile'
import { gsap } from 'gsap'

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_el, opts) => { opts?.onComplete?.(); return Promise.resolve() }),
    fromTo: vi.fn((_el, _from, opts) => { opts?.onComplete?.() }),
    set: vi.fn(),
    getProperty: vi.fn(() => 0),
    timeline: vi.fn(() => {
      const t = {}
      t.to = vi.fn(() => t)
      t.fromTo = vi.fn((_el, _from, to) => {
        if (typeof to?.rotate === 'function') { to.rotate(0); to.rotate(1) }
        return t
      })
      t.from = vi.fn(() => t)
      return t
    }),
  },
}))

vi.mock('./utils/canvas', () => ({
  renderToBlob: vi.fn(),
  triggerDownload: vi.fn(),
}))

vi.mock('./hooks/useIsMobile', () => ({ default: vi.fn(() => false) }))

beforeEach(() => {
  vi.clearAllMocks()
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
  global.FileReader = class {
    readAsDataURL() { this.onload?.({ target: { result: 'data:image/png;base64,abc' } }) }
  }
  useIsMobile.mockReturnValue(false)
  renderToBlob.mockResolvedValue(new Blob(['img'], { type: 'image/png' }))
  triggerDownload.mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
})

describe('App', () => {
  it('renders drop zone initially', () => {
    render(<App />)
    expect(screen.getByText(/drop an image/i)).toBeInTheDocument()
  })

  it('renders MEMEFORGE header', () => {
    render(<App />)
    expect(screen.getByText((_, el) => el?.className === 'logo' && el?.textContent === 'MEMEFORGE')).toBeInTheDocument()
  })

  it('shows no image loaded in panel initially', () => {
    render(<App />)
    expect(screen.getByText(/no image loaded/i)).toBeInTheDocument()
  })

  it('shows placeholder sample chips', () => {
    render(<App />)
    expect(screen.getByText('PEPE MAGE')).toBeInTheDocument()
    expect(screen.getByText('PEPE SAD')).toBeInTheDocument()
    expect(screen.getByText('PEPE')).toBeInTheDocument()
  })

  it('loads image when sample chip clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => {
      expect(screen.queryByText(/drop an image/i)).not.toBeInTheDocument()
    })
  })

  it('shows toast when adding text without image', async () => {
    render(<App />)
    const addBtn = screen.getByText(/^TEXT$/)
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByText(/upload an image first/i)).toBeInTheDocument()
    })
  })

  it('shows two default text layers after loading image', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => {
      expect(screen.getAllByText('TOP TEXT').length).toBeGreaterThan(0)
      expect(screen.getAllByText('BOTTOM TEXT').length).toBeGreaterThan(0)
    })
  })

  it('adds text layer when ADD TEXT clicked with image', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    fireEvent.click(screen.getByText(/^TEXT$/))
    await waitFor(() => {
      expect(screen.getAllByText(/NEW TEXT/).length).toBeGreaterThan(0)
    })
  })

  it('selects layer when layer row clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    const rows = document.querySelectorAll('.layer-row')
    fireEvent.click(rows[0])
    await waitFor(() => {
      expect(rows[0]).toHaveClass('is-active')
    })
  })

  it('shows toast when adding image overlay without image', async () => {
    render(<App />)
    fireEvent.click(screen.getByText(/IMG/))
    await waitFor(() => {
      expect(screen.getByText(/upload an image first/i)).toBeInTheDocument()
    })
  })

  it('removes layer when × clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    const initialRows = document.querySelectorAll('.layer-row').length
    const xBtn = document.querySelectorAll('.layer-row-x')[0]
    fireEvent.click(xBtn)
    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row').length).toBe(initialRows - 1)
    })
  })

  it('duplicates layer on duplicate button click', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    const rows = document.querySelectorAll('.layer-row')
    fireEvent.click(rows[0])
    await waitFor(() => screen.getByText('duplicate'))
    const initialCount = document.querySelectorAll('.layer-row').length
    fireEvent.click(screen.getByText('duplicate'))
    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row').length).toBe(initialCount + 1)
    })
  })

  it('shows toast when file input receives non-image file', async () => {
    render(<App />)
    const input = document.querySelector('input[accept="image/*"]')
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    await waitFor(() => {
      expect(screen.getByText(/that's not an image/i)).toBeInTheDocument()
    })
  })

  it('clears image when remove clicked in panel', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.queryByText(/no image loaded/i) === null || true)
    await waitFor(() => screen.getByText('remove'))
    fireEvent.click(screen.getByText('remove'))
    await waitFor(() => {
      expect(screen.queryByText(/drop an image/i)).toBeInTheDocument()
    })
  })

  it('handles window paste with image when no image loaded', async () => {
    render(<App />)
    const file = new File(['img'], 'paste.png', { type: 'image/png' })
    const item = { type: 'image/png', getAsFile: () => file }

    await act(async () => {
      window.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: { items: [item] },
      }))
    })
    await waitFor(() => {
      expect(screen.queryByText(/drop an image/i)).not.toBeInTheDocument()
    })
  })

  it('handles window drop event with image file', async () => {
    render(<App />)
    const file = new File(['img'], 'drop.png', { type: 'image/png' })

    await act(async () => {
      window.dispatchEvent(Object.assign(new Event('drop'), {
        preventDefault: () => {},
        dataTransfer: { files: [file] },
      }))
    })
    await waitFor(() => {
      expect(screen.queryByText(/drop an image/i)).not.toBeInTheDocument()
    })
  })

  it('updates layer text via TextEditor', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))
    const rows = document.querySelectorAll('.layer-row')
    fireEvent.click(rows[0])
    await waitFor(() => screen.getByText('duplicate'))
    const textarea = document.querySelector('textarea.ed-text')
    fireEvent.change(textarea, { target: { value: 'UPDATED' } })
    await waitFor(() => {
      expect(screen.getAllByText('UPDATED').length).toBeGreaterThan(0)
    })
  })

  it('downloads meme and calls triggerDownload', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    vi.useFakeTimers()
    fireEvent.click(screen.getByText(/DOWNLOAD/))
    await act(() => vi.runAllTimersAsync())

    expect(triggerDownload).toHaveBeenCalled()
  })

  it('copies meme to clipboard via COPY button', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { write }, configurable: true })
    global.ClipboardItem = class { constructor(data) { this.data = data } }

    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    vi.useFakeTimers()
    fireEvent.click(screen.getByText(/COPY/))
    await act(() => vi.runAllTimersAsync())
    vi.useRealTimers()

    expect(write).toHaveBeenCalled()
  })

  it('shows toast when renderToBlob throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderToBlob.mockRejectedValue(new Error('canvas error'))

    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    vi.useFakeTimers()
    fireEvent.click(screen.getByText(/DOWNLOAD/))
    await act(() => vi.runAllTimersAsync())
    vi.useRealTimers()

    expect(screen.getByText(/export failed/i)).toBeInTheDocument()
    spy.mockRestore()
  })

  it('download button disabled when no image', () => {
    render(<App />)
    const btn = screen.queryByText(/DOWNLOAD/)
    if (btn) expect(btn.closest('button')).toBeDisabled()
  })

  it('loads overlay image via second file input', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const initialCount = document.querySelectorAll('.layer-row').length
    const overlayInput = document.querySelectorAll('input[accept="image/*"]')[1]
    const file = new File(['img'], 'overlay.png', { type: 'image/png' })
    Object.defineProperty(overlayInput, 'files', { value: [file] })
    fireEvent.change(overlayInput)

    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row').length).toBeGreaterThan(initialCount)
    })
  })

  it('shows toast for non-image overlay file', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const overlayInput = document.querySelectorAll('input[accept="image/*"]')[1]
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    Object.defineProperty(overlayInput, 'files', { value: [file] })
    fireEvent.change(overlayInput)

    await waitFor(() => {
      expect(screen.getByText(/that's not an image/i)).toBeInTheDocument()
    })
  })

  it('no-op when overlay file input changes with no file', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const overlayInput = document.querySelectorAll('input[accept="image/*"]')[1]
    fireEvent.change(overlayInput)

    expect(screen.queryByText(/that's not an image/i)).not.toBeInTheDocument()
  })

  it('no-op when main file input changes with no file', () => {
    render(<App />)
    const input = document.querySelector('input[accept="image/*"]')
    fireEvent.change(input)
    expect(screen.queryByText(/that's not an image/i)).not.toBeInTheDocument()
  })

  it('paste when image loaded adds overlay layer', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const initialCount = document.querySelectorAll('.layer-row').length
    const file = new File(['img'], 'paste.png', { type: 'image/png' })
    const item = { type: 'image/png', getAsFile: () => file }

    await act(async () => {
      window.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: { items: [item] },
      }))
    })

    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row').length).toBeGreaterThan(initialCount)
    })
  })

  it('reorders layers via drag and drop', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const rows = document.querySelectorAll('.layer-row')
    const dt = { effectAllowed: '', dropEffect: '' }
    fireEvent.dragStart(rows[0], { dataTransfer: dt })
    fireEvent.dragOver(rows[1], { dataTransfer: dt })
    fireEvent.drop(rows[1], { dataTransfer: dt })

    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row')[0]).toHaveTextContent('BOTTOM TEXT')
    })
  })

  it('reorderLayers same index is no-op', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const rows = document.querySelectorAll('.layer-row')
    const dt = { effectAllowed: '', dropEffect: '' }
    fireEvent.dragStart(rows[0], { dataTransfer: dt })
    fireEvent.dragOver(rows[0], { dataTransfer: dt })
    fireEvent.drop(rows[0], { dataTransfer: dt })

    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row')[0]).toHaveTextContent('TOP TEXT')
    })
  })

  it('mobile selectLayer adds is-mobile class and opens sheet', async () => {
    useIsMobile.mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const rows = document.querySelectorAll('.layer-row')
    fireEvent.click(rows[0])

    await waitFor(() => {
      expect(document.querySelector('.app')).toHaveClass('is-mobile')
    })
  })

  it('DropZone click triggers file input click', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)

    fireEvent.click(document.querySelector('.drop'))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('replace button in panel triggers file input click', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getByText('replace'))

    fireEvent.click(screen.getByText('replace'))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('IMG button with image triggers overlay input click', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    fireEvent.click(screen.getByText(/IMG/))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('upload button in Header triggers file input click', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)

    fireEvent.click(screen.getByText(/UPLOAD/))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('removes splash element on mount', () => {
    const splash = document.createElement('div')
    splash.className = 'splash'
    document.body.appendChild(splash)

    render(<App />)

    expect(document.querySelector('.splash')).not.toBeInTheDocument()
  })

  it('toggleTheme switches light to dark and back', async () => {
    render(<App />)
    const themeBtn = document.querySelector('.theme-btn')

    fireEvent.click(themeBtn)
    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(themeBtn)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('paste event with no clipboardData items is no-op', async () => {
    render(<App />)
    await act(async () => {
      window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: { items: null } }))
    })
    expect(screen.queryByText(/drop an image/i)).toBeInTheDocument()
  })

  it('paste event with non-image item is no-op', async () => {
    render(<App />)
    const item = { type: 'text/plain', getAsFile: () => null }
    await act(async () => {
      window.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: { items: [item] },
      }))
    })
    expect(screen.queryByText(/drop an image/i)).toBeInTheDocument()
  })

  it('paste event with image item but getAsFile null is no-op', async () => {
    render(<App />)
    const item = { type: 'image/png', getAsFile: () => null }
    await act(async () => {
      window.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: { items: [item] },
      }))
    })
    expect(screen.queryByText(/drop an image/i)).toBeInTheDocument()
  })

  it('deselects when removing the currently selected layer', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    const rows = document.querySelectorAll('.layer-row')
    fireEvent.click(rows[0])
    await waitFor(() => expect(rows[0]).toHaveClass('is-active'))

    fireEvent.click(document.querySelectorAll('.layer-row-x')[0])

    await waitFor(() => {
      expect(document.querySelectorAll('.layer-row.is-active').length).toBe(0)
    })
  })

  it('mobile without image has no-image class on app', () => {
    useIsMobile.mockReturnValue(true)
    render(<App />)
    expect(document.querySelector('.app')).toHaveClass('no-image')
  })

  it('mobile with image does not have no-image class', async () => {
    useIsMobile.mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => {
      expect(document.querySelector('.app')).not.toHaveClass('no-image')
    })
  })

  it('desktop without image does not have no-image class', () => {
    useIsMobile.mockReturnValue(false)
    render(<App />)
    expect(document.querySelector('.app')).not.toHaveClass('no-image')
  })

  it('initializes dark theme from prefers-color-scheme when no stored theme', () => {
    localStorage.removeItem('mf-theme')
    const orig = globalThis.matchMedia
    globalThis.matchMedia = vi.fn(() => ({ matches: true }))
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    globalThis.matchMedia = orig
  })

  it('shows toast when image fails to load', async () => {
    global.Image = class {
      set src(_v) { this.onerror?.() }
    }
    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => {
      expect(screen.getByText(/couldn't load that image/i)).toBeInTheDocument()
    })
  })

  it('auto-dismisses toast after timeout', async () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByText(/^TEXT$/))
    expect(screen.getByText(/upload an image first/i)).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(2300))
    expect(screen.queryByText(/upload an image first/i)).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('overlay input change without image shows upload-first toast', async () => {
    render(<App />)
    const overlayInput = document.querySelectorAll('input[accept="image/*"]')[1]
    const file = new File(['img'], 'overlay.png', { type: 'image/png' })
    Object.defineProperty(overlayInput, 'files', { value: [file] })
    fireEvent.change(overlayInput)
    await waitFor(() => {
      expect(screen.getByText(/upload an image first/i)).toBeInTheDocument()
    })
  })

  it('skips side panel fromTo animation when panel already open', async () => {
    gsap.getProperty.mockReturnValueOnce(360)

    render(<App />)
    fireEvent.click(screen.getByText('PEPE MAGE'))
    await waitFor(() => screen.getAllByText('TOP TEXT'))

    expect(gsap.fromTo).not.toHaveBeenCalledWith(
      expect.anything(),
      { width: 0 },
      expect.objectContaining({ width: 360 }),
    )
  })
})
