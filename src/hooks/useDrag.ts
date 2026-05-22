export function startDrag(e: PointerEvent, onMove: (dx: number, dy: number) => void): void {
  const startX = e.clientX
  const startY = e.clientY
  const move = (ev: PointerEvent) => onMove(ev.clientX - startX, ev.clientY - startY)
  const up = () => {
    globalThis.removeEventListener('pointermove', move)
    globalThis.removeEventListener('pointerup', up)
  }
  globalThis.addEventListener('pointermove', move)
  globalThis.addEventListener('pointerup', up)
}
