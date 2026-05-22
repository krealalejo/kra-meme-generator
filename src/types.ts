export interface MemeImage {
  src: string
  w: number
  h: number
}

export interface Box {
  w: number
  h: number
}

export interface TextLayerData {
  type: 'text'
  id: string
  text: string
  x: number
  y: number
  size: number
  rotation: number
  font: string
  weight: number
  color: string
  stroke: number
  strokeColor: string
  tracking: number
  uppercase: boolean
  shadow: boolean
}

export interface ImageLayerData {
  type: 'image'
  id: string
  src: string
  x: number
  y: number
  w: number
  aspectRatio: number
  rotation: number
}

export type Layer = TextLayerData | ImageLayerData

export type LayerPatch = Partial<Omit<TextLayerData, 'type' | 'id'> & Omit<ImageLayerData, 'type' | 'id'>>
