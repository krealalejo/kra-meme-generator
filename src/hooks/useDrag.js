export function startDrag(e, onMove) {
  const startX = e.clientX
  const startY = e.clientY
  const move = (ev) => onMove(ev.clientX - startX, ev.clientY - startY)
  const up = () => {
    globalThis.removeEventListener('pointermove', move)
    globalThis.removeEventListener('pointerup', up)
  }
  globalThis.addEventListener('pointermove', move)
  globalThis.addEventListener('pointerup', up)
}
