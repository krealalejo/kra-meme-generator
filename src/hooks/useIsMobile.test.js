import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useIsMobile from './useIsMobile'

function setupMatchMedia(matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches,
      addEventListener: vi.fn((_, handler) => { window.__mqHandler = handler }),
      removeEventListener: vi.fn(),
    })),
  })
}

beforeEach(() => {
  window.__mqHandler = null
  setupMatchMedia(false)
})

describe('useIsMobile', () => {
  it('returns false when viewport is wide', () => {
    setupMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is narrow', () => {
    setupMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates state on matchMedia change event', () => {
    setupMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => window.__mqHandler({ matches: true }))
    expect(result.current).toBe(true)
    act(() => window.__mqHandler({ matches: false }))
    expect(result.current).toBe(false)
  })

  it('removes event listener on unmount', () => {
    const removeEventListener = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener,
      })),
    })
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(removeEventListener).toHaveBeenCalled()
  })
})
