export function startDrag(e, onMove) {
  const startX = e.clientX
  const startY = e.clientY
  const move = (ev) => onMove(ev.clientX - startX, ev.clientY - startY)
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}
