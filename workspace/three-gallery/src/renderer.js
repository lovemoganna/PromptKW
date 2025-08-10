import * as THREE from 'three'

let rendererInstance = null
let resizeObserver = null

export function createRenderer(container) {
  if (rendererInstance) return rendererInstance

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  function onResize() {
    const w = container.clientWidth
    const h = container.clientHeight
    renderer.setSize(w, h, false)
  }

  window.addEventListener('resize', onResize)
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

  rendererInstance = renderer
  return renderer
}

export function getRenderer() {
  return rendererInstance
}

export function disposeRenderer() {
  if (!rendererInstance) return
  try {
    resizeObserver && resizeObserver.disconnect()
  } catch {}
  try {
    rendererInstance.dispose()
  } catch {}
  if (rendererInstance.domElement?.parentElement) {
    rendererInstance.domElement.parentElement.removeChild(rendererInstance.domElement)
  }
  rendererInstance = null
}