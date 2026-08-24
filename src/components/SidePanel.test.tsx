import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SidePanel from './SidePanel'
import { mkText, mkImageLayer } from '../utils/text'

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_el, opts) => { opts?.onComplete?.() }),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => { const t = {}; t.to = vi.fn(() => t); t.fromTo = vi.fn(() => t); return t }),
  },
}))

const base = {
  image: null,
  layers: [],
  selected: null,
  selectedId: null,
  setSelectedId: vi.fn(),
  addText: vi.fn(),
  addImageLayer: vi.fn(),
  updateLayer: vi.fn(),
  removeLayer: vi.fn(),
  duplicateLayer: vi.fn(),
  reorderLayers: vi.fn(),
  onReplaceImage: vi.fn(),
  onClearImage: vi.fn(),
  isMobile: false,
  mobileTab: null,
}

beforeEach(() => vi.clearAllMocks())

describe('SidePanel — image block', () => {
  it('shows no image loaded when image is null', () => {
    render(<SidePanel {...base} />)
    expect(screen.getByText(/no image loaded/i)).toBeInTheDocument()
  })

  it('shows image dimensions when image provided', () => {
    render(<SidePanel {...base} image={{ src: 'x.jpg', w: 800, h: 600 }} />)
    expect(screen.getByText('800×600')).toBeInTheDocument()
  })

  it('calls onReplaceImage when replace clicked', () => {
    const onReplaceImage = vi.fn()
    render(<SidePanel {...base} image={{ src: 'x.jpg', w: 200, h: 100 }} onReplaceImage={onReplaceImage} />)
    fireEvent.click(screen.getByText('replace'))
    expect(onReplaceImage).toHaveBeenCalledOnce()
  })

  it('calls onClearImage when remove clicked', () => {
    const onClearImage = vi.fn()
    render(<SidePanel {...base} image={{ src: 'x.jpg', w: 200, h: 100 }} onClearImage={onClearImage} />)
    fireEvent.click(screen.getByText('remove'))
    expect(onClearImage).toHaveBeenCalledOnce()
  })
})

describe('SidePanel — layers block', () => {
  it('shows empty message when no layers', () => {
    render(<SidePanel {...base} />)
    expect(screen.getByText(/no layers yet/i)).toBeInTheDocument()
  })

  it('calls addText when TEXT button clicked', () => {
    const addText = vi.fn()
    render(<SidePanel {...base} addText={addText} />)
    fireEvent.click(screen.getByText(/TEXT/))
    expect(addText).toHaveBeenCalledOnce()
  })

  it('calls addImageLayer when IMG button clicked', () => {
    const addImageLayer = vi.fn()
    render(<SidePanel {...base} addImageLayer={addImageLayer} />)
    fireEvent.click(screen.getByText(/IMG/))
    expect(addImageLayer).toHaveBeenCalledOnce()
  })

  it('renders a row for each layer', () => {
    const layers = [mkText({ text: 'ALPHA' }), mkText({ text: 'BETA' })]
    render(<SidePanel {...base} layers={layers} />)
    expect(screen.getByText('ALPHA')).toBeInTheDocument()
    expect(screen.getByText('BETA')).toBeInTheDocument()
  })

  it('calls setSelectedId when layer row clicked', () => {
    const setSelectedId = vi.fn()
    const layer = mkText({ text: 'CLICK ME' })
    render(<SidePanel {...base} layers={[layer]} setSelectedId={setSelectedId} />)
    fireEvent.click(screen.getByText('CLICK ME'))
    expect(setSelectedId).toHaveBeenCalledWith(layer.id)
  })

  it('shows active class on selected layer row', () => {
    const layer = mkText({ text: 'SELECTED' })
    render(<SidePanel {...base} layers={[layer]} selectedId={layer.id} />)
    const row = screen.getByText('SELECTED').closest('.layer-row')
    expect(row).toHaveClass('is-active')
  })

  it('calls removeLayer when × clicked (via gsap onComplete)', () => {
    const removeLayer = vi.fn()
    const layer = mkText({ text: 'DELETE ME' })
    render(<SidePanel {...base} layers={[layer]} removeLayer={removeLayer} />)
    const xBtn = screen.getByTitle('delete')
    fireEvent.click(xBtn)
    expect(removeLayer).toHaveBeenCalledWith(layer.id)
  })

  it('shows IMG type label for image layers', () => {
    const layer = mkImageLayer({ src: 'img.png' })
    render(<SidePanel {...base} layers={[layer]} />)
    const imgLabels = screen.getAllByText('IMG')
    expect(imgLabels.length).toBeGreaterThan(0)
    expect(screen.getByText('[image]')).toBeInTheDocument()
  })

  it('shows layer count in subtitle', () => {
    const layers = [mkText(), mkText()]
    render(<SidePanel {...base} layers={layers} />)
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('shows singular item label for one layer', () => {
    render(<SidePanel {...base} layers={[mkText()]} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('calls setSelectedId when Enter pressed on layer row', () => {
    const setSelectedId = vi.fn()
    const layer = mkText({ text: 'KEYNAV' })
    render(<SidePanel {...base} layers={[layer]} setSelectedId={setSelectedId} />)
    const row = screen.getByText('KEYNAV').closest('.layer-row')
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(setSelectedId).toHaveBeenCalledWith(layer.id)
  })

  it('calls setSelectedId when Space pressed on layer row', () => {
    const setSelectedId = vi.fn()
    const layer = mkText({ text: 'SPACENAV' })
    render(<SidePanel {...base} layers={[layer]} setSelectedId={setSelectedId} />)
    const row = screen.getByText('SPACENAV').closest('.layer-row')
    fireEvent.keyDown(row, { key: ' ' })
    expect(setSelectedId).toHaveBeenCalledWith(layer.id)
  })

  it('ignores other keys on layer row', () => {
    const setSelectedId = vi.fn()
    const layer = mkText({ text: 'OTHERKEY' })
    render(<SidePanel {...base} layers={[layer]} setSelectedId={setSelectedId} />)
    const row = screen.getByText('OTHERKEY').closest('.layer-row')
    fireEvent.keyDown(row, { key: 'Escape' })
    expect(setSelectedId).not.toHaveBeenCalled()
  })

  it('shows (empty) for text layer with no text', () => {
    const layer = mkText({ text: '' })
    render(<SidePanel {...base} layers={[layer]} />)
    expect(screen.getByText('(empty)')).toBeInTheDocument()
  })

  it('clears drag-over state on drag leave', () => {
    const layers = [mkText({ text: 'A' }), mkText({ text: 'B' })]
    render(<SidePanel {...base} layers={layers} />)
    const rows = screen.getAllByRole('button', { name: /A|B/ })
    fireEvent.dragOver(rows[1], { dataTransfer: { dropEffect: '' } })
    expect(rows[1]).toHaveClass('is-drag-over')
    fireEvent.dragLeave(rows[1])
    expect(rows[1]).not.toHaveClass('is-drag-over')
  })

  it('resets drag state on drag end', () => {
    const reorderLayers = vi.fn()
    const layers = [mkText({ text: 'A' }), mkText({ text: 'B' })]
    render(<SidePanel {...base} layers={layers} reorderLayers={reorderLayers} />)
    const rows = screen.getAllByRole('button', { name: /A|B/ })
    fireEvent.dragStart(rows[0], { dataTransfer: { effectAllowed: '' } })
    fireEvent.dragEnd(rows[0])
    fireEvent.drop(rows[1], { dataTransfer: {} })
    expect(reorderLayers).not.toHaveBeenCalled()
  })

  it('triggers reorderLayers on drag and drop', () => {
    const reorderLayers = vi.fn()
    const layers = [mkText({ text: 'A' }), mkText({ text: 'B' })]
    render(<SidePanel {...base} layers={layers} reorderLayers={reorderLayers} />)
    const rows = screen.getAllByRole('button', { name: /A|B/ })
    fireEvent.dragStart(rows[0], { dataTransfer: { effectAllowed: '' } })
    fireEvent.dragOver(rows[1], { dataTransfer: { dropEffect: '' }, preventDefault: () => {} })
    fireEvent.drop(rows[1], { preventDefault: () => {} })
    expect(reorderLayers).toHaveBeenCalledWith(0, 1)
  })
})

describe('SidePanel — edit block', () => {
  it('shows nothing selected message when no selected', () => {
    render(<SidePanel {...base} />)
    expect(screen.getByText(/nothing selected/i)).toBeInTheDocument()
  })

  it('shows TextEditor when text layer selected', () => {
    const layer = mkText({ text: 'EDIT THIS' })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} />)
    expect(screen.getByDisplayValue('EDIT THIS')).toBeInTheDocument()
  })

  it('shows ImageEditor when image layer selected', () => {
    const layer = mkImageLayer({ src: 'img.png', rotation: 15 })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} />)
    expect(screen.getByText('15°')).toBeInTheDocument()
  })

  it('updateLayer called from ImageEditor rotation change', () => {
    const updateLayer = vi.fn()
    const layer = mkImageLayer({ src: 'img.png', rotation: 0 })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} updateLayer={updateLayer} />)
    fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: '30' } })
    expect(updateLayer).toHaveBeenCalledWith(layer.id, { rotation: 30 })
  })

  it('duplicateLayer called from ImageEditor duplicate button', () => {
    const duplicateLayer = vi.fn()
    const layer = mkImageLayer({ src: 'img.png' })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} duplicateLayer={duplicateLayer} />)
    fireEvent.click(screen.getByText('duplicate'))
    expect(duplicateLayer).toHaveBeenCalledWith(layer.id)
  })

  it('removeLayer called from ImageEditor delete button', () => {
    const removeLayer = vi.fn()
    const layer = mkImageLayer({ src: 'img.png' })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} removeLayer={removeLayer} />)
    fireEvent.click(screen.getByText('delete'))
    expect(removeLayer).toHaveBeenCalledWith(layer.id)
  })

  it('removeLayer called from TextEditor delete button', () => {
    const removeLayer = vi.fn()
    const layer = mkText({ text: 'DEL' })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} removeLayer={removeLayer} />)
    fireEvent.click(screen.getByText('delete'))
    expect(removeLayer).toHaveBeenCalledWith(layer.id)
  })

  it('updateLayer called from TextEditor text change', () => {
    const updateLayer = vi.fn()
    const layer = mkText({ text: 'OLD' })
    render(<SidePanel {...base} layers={[layer]} selected={layer} selectedId={layer.id} updateLayer={updateLayer} />)
    fireEvent.change(screen.getByDisplayValue('OLD'), { target: { value: 'NEW' } })
    expect(updateLayer).toHaveBeenCalledWith(layer.id, { text: 'NEW' })
  })
})

describe('SidePanel — mobile', () => {
  it('only shows image tab when mobileTab=image', () => {
    render(<SidePanel {...base} isMobile={true} mobileTab="image" />)
    expect(screen.getByText(/no image loaded/i)).toBeInTheDocument()
    expect(screen.queryByText(/no layers yet/i)).not.toBeInTheDocument()
  })

  it('only shows layers tab when mobileTab=layers', () => {
    render(<SidePanel {...base} isMobile={true} mobileTab="layers" />)
    expect(screen.getByText(/no layers yet/i)).toBeInTheDocument()
    expect(screen.queryByText(/no image loaded/i)).not.toBeInTheDocument()
  })
})
