import { createRenderer } from './renderer.js'

export function makeRouter({ container }) {
  /** @type {{ start: Function, stop: Function, dispose: Function } | null} */
  let activeScene = null
  const renderer = createRenderer(container)

  async function navigate(hash) {
    const route = (hash || '').replace(/^#/, '') || '/galaxy'
    const path = route.startsWith('/') ? route : '/' + route

    let loader
    switch (path) {
      case '/galaxy':
        loader = () => import('./scenes/galaxy.js')
        break
      case '/wave':
        loader = () => import('./scenes/wave.js')
        break
      case '/instanced':
        loader = () => import('./scenes/instanced.js')
        break
      case '/raymarch':
        loader = () => import('./scenes/raymarch.js')
        break
      default:
        loader = () => import('./scenes/galaxy.js')
        break
    }

    const mod = await loader()

    if (activeScene) {
      try { activeScene.stop && activeScene.stop() } catch {}
      try { activeScene.dispose && activeScene.dispose() } catch {}
      activeScene = null
    }

    activeScene = await mod.createScene({ renderer, container })
    activeScene.start()
  }

  return { navigate }
}