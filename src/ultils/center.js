export function centerElement(el) {
  if (!el) return
  const parent = el.parentNode
  const { clientWidth, clientHeight } = parent
  const { width, height } = el.getBoundingClientRect()
  const left = (clientWidth - width) / 2
  const top = (clientHeight - height) / 2
  return ` left: ${left}px; top: ${top}px;`
}
