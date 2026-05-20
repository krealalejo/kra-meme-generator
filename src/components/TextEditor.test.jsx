import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TextEditor from './TextEditor'
import { mkText } from '../utils/text'
import { FONTS, PRESET_COLORS } from '../constants'

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_el, opts) => { opts?.onComplete?.() }),
    fromTo: vi.fn(),
  },
}))

function mkT(overrides = {}) {
  return mkText({ text: 'hello', size: 0.1, rotation: 0, stroke: 0, tracking: 0, uppercase: false, shadow: false, weight: 700, ...overrides })
}

beforeEach(() => vi.clearAllMocks())

describe('TextEditor', () => {
  it('renders textarea with current text', () => {
    render(<TextEditor t={mkT()} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls onUpdate with new text on textarea change', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByDisplayValue('hello'), { target: { value: 'world' } })
    expect(onUpdate).toHaveBeenCalledWith({ text: 'world' })
  })

  it('renders all font buttons', () => {
    render(<TextEditor t={mkT()} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    for (const f of FONTS) {
      expect(screen.getByText(f.label)).toBeInTheDocument()
    }
  })

  it('calls onUpdate with font id when font button clicked', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ font: 'impact' })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Grotesk'))
    expect(onUpdate).toHaveBeenCalledWith({ font: 'grotesk' })
  })

  it('active font button has is-on class', () => {
    render(<TextEditor t={mkT({ font: 'mono' })} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const monoBtn = screen.getByText('Mono')
    expect(monoBtn).toHaveClass('is-on')
  })

  it('calls onUpdate on size slider change', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[0], { target: { value: '0.2' } })
    expect(onUpdate).toHaveBeenCalledWith({ size: 0.2 })
  })

  it('calls onUpdate on rotation slider change', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[1], { target: { value: '30' } })
    expect(onUpdate).toHaveBeenCalledWith({ rotation: 30 })
  })

  it('calls onUpdate on stroke slider change', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[2], { target: { value: '0.5' } })
    expect(onUpdate).toHaveBeenCalledWith({ stroke: 0.5 })
  })

  it('calls onUpdate on tracking slider change', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[3], { target: { value: '0.1' } })
    expect(onUpdate).toHaveBeenCalledWith({ tracking: 0.1 })
  })

  it('renders color swatches for fill', () => {
    render(<TextEditor t={mkT({ color: PRESET_COLORS[0] })} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const swatches = document.querySelectorAll('.swatch')
    expect(swatches.length).toBeGreaterThan(0)
  })

  it('calls onUpdate with color when swatch clicked', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ color: '#FFFFFF' })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    const swatches = document.querySelectorAll('.swatch:not(.swatch-custom)')
    fireEvent.click(swatches[1])
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ color: expect.any(String) }))
  })

  it('toggles uppercase on UPPER button click', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ uppercase: false })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('UPPER'))
    expect(onUpdate).toHaveBeenCalledWith({ uppercase: true })
  })

  it('UPPER has is-on class when uppercase is true', () => {
    render(<TextEditor t={mkT({ uppercase: true })} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('UPPER')).toHaveClass('is-on')
  })

  it('toggles bold off when weight >= 700', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ weight: 700 })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('BOLD'))
    expect(onUpdate).toHaveBeenCalledWith({ weight: 500 })
  })

  it('toggles bold on when weight < 700', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ weight: 400 })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('BOLD'))
    expect(onUpdate).toHaveBeenCalledWith({ weight: 800 })
  })

  it('toggles shadow on SHADOW click', () => {
    const onUpdate = vi.fn()
    render(<TextEditor t={mkT({ shadow: false })} onUpdate={onUpdate} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('SHADOW'))
    expect(onUpdate).toHaveBeenCalledWith({ shadow: true })
  })

  it('calls onDuplicate on duplicate button click', () => {
    const onDuplicate = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={vi.fn()} onDuplicate={onDuplicate} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('duplicate'))
    expect(onDuplicate).toHaveBeenCalledOnce()
  })

  it('calls onDelete on delete button click (via gsap onComplete)', () => {
    const onDelete = vi.fn()
    render(<TextEditor t={mkT()} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('delete'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('shows size percentage display', () => {
    render(<TextEditor t={mkT({ size: 0.1 })} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows rotation degree display', () => {
    render(<TextEditor t={mkT({ rotation: 15 })} onUpdate={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('15°')).toBeInTheDocument()
  })
})
