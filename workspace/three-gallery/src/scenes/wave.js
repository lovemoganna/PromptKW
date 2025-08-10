import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const vertex = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vec3 p = position;
    float w = sin(p.x * 2.0 + uTime * 1.2) * 0.35 + cos(p.y * 2.2 - uTime * 1.1) * 0.35;
    p.z += w;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    float h = vPos.z * 0.5 + 0.5;
    vec3 c1 = vec3(0.49, 0.51, 1.0);
    vec3 c2 = vec3(0.62, 1.0, 0.94);
    vec3 col = mix(c1, c2, smoothstep(0.0, 1.0, h));
    float grid = (step(0.497, fract(vUv.x*10.0)) - step(0.503, fract(vUv.x*10.0))) + (step(0.497, fract(vUv.y*10.0)) - step(0.503, fract(vUv.y*10.0)));
    col += grid * 0.08;
    gl_FragColor = vec4(col, 1.0);
  }
`

export async function createScene({ renderer, container }) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x10122a, 6, 22)

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(4.5, 3.5, 6.5)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 0, 0)

  const geo = new THREE.PlaneGeometry(12, 12, 220, 220)
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    fog: true,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  scene.add(mesh)

  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x1f2242, 1.0)
  scene.add(hemi)

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
    mat.uniforms.uTime.value = t
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