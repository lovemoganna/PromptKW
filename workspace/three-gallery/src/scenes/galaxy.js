import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export async function createScene({ renderer, container }) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0e1024, 0.03)

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200)
  camera.position.set(3.2, 2.6, 5.2)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const galaxy = buildGalaxy()
  scene.add(galaxy)

  const lights = new THREE.Group()
  const a = new THREE.PointLight(0x6677ff, 2.0, 50)
  a.position.set(3, 4, 2)
  const b = new THREE.PointLight(0xff88aa, 1.4, 50)
  b.position.set(-4, -2, -3)
  lights.add(a, b)
  scene.add(lights)

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
    galaxy.rotation.z = t * 0.03
    lights.rotation.y = Math.sin(t * 0.35) * 0.2
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
      galaxy.geometry.dispose()
      galaxy.material.dispose()
      scene.traverse((obj) => {
        if (obj.isMesh || obj.isLine || obj.isPoints) {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
            else obj.material.dispose()
          }
        }
      })
    },
  }
}

function buildGalaxy() {
  const numPoints = 20000
  const radius = 6
  const branches = 5
  const spin = 1.1
  const randomness = 0.28

  const positions = new Float32Array(numPoints * 3)
  const colors = new Float32Array(numPoints * 3)

  const colorInside = new THREE.Color(0x9ee8ff)
  const colorOutside = new THREE.Color(0x7c82ff)

  for (let i = 0; i < numPoints; i++) {
    const r = Math.random() ** 0.6 * radius
    const branch = i % branches
    const branchAngle = (branch / branches) * Math.PI * 2

    const spinAngle = r * spin
    const randomX = (Math.random() - 0.5) * randomness * r
    const randomY = (Math.random() - 0.5) * randomness * 0.4 * r
    const randomZ = (Math.random() - 0.5) * randomness * r

    const x = Math.cos(branchAngle + spinAngle) * r + randomX
    const y = randomY * 0.6
    const z = Math.sin(branchAngle + spinAngle) * r + randomZ

    positions[i * 3 + 0] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    const mixed = colorInside.clone().lerp(colorOutside, r / radius)
    colors[i * 3 + 0] = mixed.r
    colors[i * 3 + 1] = mixed.g
    colors[i * 3 + 2] = mixed.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.035,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  return points
}