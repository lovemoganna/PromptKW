import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export async function createScene({ renderer, container }) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0f1126, 8, 28)

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(8, 7, 10)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 0.5, 0)

  const COUNT = 1200
  const geo = new THREE.BoxGeometry(0.28, 0.28, 0.28)
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 })
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const color = new THREE.Color()
  const dummy = new THREE.Object3D()

  const side = Math.ceil(Math.pow(COUNT, 1/3))
  let index = 0
  for (let x = 0; x < side && index < COUNT; x++) {
    for (let y = 0; y < side && index < COUNT; y++) {
      for (let z = 0; z < side && index < COUNT; z++) {
        dummy.position.set((x - side/2) * 0.5, (y - side/2) * 0.5, (z - side/2) * 0.5)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
        const t = index / COUNT
        color.setHSL(0.62 + 0.25 * t, 0.75, 0.6 - 0.25 * t)
        mesh.setColorAt(index, color)
        index++
      }
    }
  }
  mesh.instanceColor.needsUpdate = true
  scene.add(mesh)

  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(3, 5, 4)
  scene.add(dir)
  scene.add(new THREE.AmbientLight(0x6677ff, 0.4))

  let running = false
  let rafId = 0
  const clock = new THREE.Clock()

  function resize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
  }

  function tick() {
    if (!running) return
    const t = clock.getElapsedTime()
    const obj = new THREE.Object3D()
    for (let i = 0; i < COUNT; i++) {
      mesh.getMatrixAt(i, obj.matrix)
      obj.matrix.decompose(obj.position, obj.quaternion, obj.scale)
      obj.rotation.y += 0.002 + (i % 7) * 0.00005
      obj.rotation.x += 0.001 + (i % 11) * 0.00003
      const s = 0.9 + 0.25 * Math.sin(t * 1.2 + i * 0.03)
      obj.scale.setScalar(s)
      obj.updateMatrix()
      mesh.setMatrixAt(i, obj.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    controls.update()
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', resize)

  return {
    start() { running = true; tick() },
    stop() { running = false; cancelAnimationFrame(rafId) },
    dispose() {
      window.removeEventListener('resize', resize)
      controls.dispose()
      geo.dispose(); mat.dispose()
    },
  }
}