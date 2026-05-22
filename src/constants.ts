export interface Font {
  id: string
  label: string
  css: string
}

export const FONTS: Font[] = [
  { id: 'impact', label: 'Impact', css: '"Anton", "Impact", "Haettenschweiler", sans-serif' },
  { id: 'grotesk', label: 'Grotesk', css: '"Space Grotesk", system-ui, sans-serif' },
  { id: 'mono', label: 'Mono', css: '"JetBrains Mono", monospace' },
  { id: 'serif', label: 'Serif', css: 'Georgia, "Times New Roman", serif' },
]

export const PRESET_COLORS: string[] = ['#FFFFFF', '#0E0E0E', '#C8F02C', '#FF4D8D', '#2E6BFF', '#FFD400']
export const STROKE_COLORS: string[] = ['#0E0E0E', '#FFFFFF', '#FF4D8D', '#2E6BFF']
