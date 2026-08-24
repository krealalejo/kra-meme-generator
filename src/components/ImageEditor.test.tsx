import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageEditor from './ImageEditor'
import { mkImageLayer } from '../utils/text'

vi.mock('./CropModal', () => ({
  default: ({ onClose, onSave }) => (
    <div data-testid="crop-modal">
      <button onClick={onClose}>close-crop</button>
      <button onClick={() => onSave('data:image/png;base64,x', 1.5)}>save-crop</button>
    </div>
  ),
}))

function mkProps(overrides = {}) {
  return {
    layer: mkImageLayer({ src: 'img.png', rotation: 0 }),
    onUpdate: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('ImageEditor', () => {
  it('renders size and rotation sliders', () => {
    render(<ImageEditor {...mkProps()} />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('shows current rotation value', () => {
    render(<ImageEditor {...mkProps({ layer: mkImageLayer({ rotation: 30 }) })} />)
    expect(screen.getByText('30°')).toBeInTheDocument()
  })

  it('shows current size value', () => {
    render(<ImageEditor {...mkProps({ layer: mkImageLayer({ w: 0.4 }) })} />)
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('calls onUpdate on rotation slider change', () => {
    const onUpdate = vi.fn()
    render(<ImageEditor {...mkProps({ onUpdate })} />)
    fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: '45' } })
    expect(onUpdate).toHaveBeenCalledWith({ rotation: 45 })
  })

  it('calls onUpdate on size slider change', () => {
    const onUpdate = vi.fn()
    render(<ImageEditor {...mkProps({ onUpdate })} />)
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '0.6' } })
    expect(onUpdate).toHaveBeenCalledWith({ w: 0.6 })
  })

  it('calls onDuplicate on duplicate click', () => {
    const onDuplicate = vi.fn()
    render(<ImageEditor {...mkProps({ onDuplicate })} />)
    fireEvent.click(screen.getByText('duplicate'))
    expect(onDuplicate).toHaveBeenCalledOnce()
  })

  it('calls onDelete on delete click', () => {
    const onDelete = vi.fn()
    render(<ImageEditor {...mkProps({ onDelete })} />)
    fireEvent.click(screen.getByText('delete'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('opens CropModal on crop click', () => {
    render(<ImageEditor {...mkProps()} />)
    fireEvent.click(screen.getByText('crop'))
    expect(screen.getByTestId('crop-modal')).toBeInTheDocument()
  })

  it('closes CropModal on discard', () => {
    render(<ImageEditor {...mkProps()} />)
    fireEvent.click(screen.getByText('crop'))
    fireEvent.click(screen.getByText('close-crop'))
    expect(screen.queryByTestId('crop-modal')).not.toBeInTheDocument()
  })

  it('calls onUpdate with new src and aspectRatio on crop save', () => {
    const onUpdate = vi.fn()
    render(<ImageEditor {...mkProps({ onUpdate })} />)
    fireEvent.click(screen.getByText('crop'))
    fireEvent.click(screen.getByText('save-crop'))
    expect(onUpdate).toHaveBeenCalledWith({ src: 'data:image/png;base64,x', aspectRatio: 1.5 })
    expect(screen.queryByTestId('crop-modal')).not.toBeInTheDocument()
  })
})
