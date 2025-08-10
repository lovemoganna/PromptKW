import * as THREE from 'three'

const vertex = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;

  // rotate 2D
  mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

  float sdSphere(vec3 p, float r){ return length(p) - r; }
  float sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
  float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)), 0.0); }

  float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5*(d2 - d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0 - h);
  }

  float map(vec3 p) {
    vec3 q = p;
    q.xz *= rot(uTime * 0.15);
    float d1 = sdSphere(q, 0.9);
    vec3 r = p; r.xy *= rot(uTime*0.3); r.z += sin(uTime*0.7)*0.2;
    float d2 = sdTorus(r, vec2(1.2, 0.25));
    vec3 b = p; b.xy *= rot(1.57); b.xz *= rot(uTime*0.2);
    float d3 = sdBox(b, vec3(0.6));
    float d = opSmoothUnion(d1, d2, 0.6);
    d = opSmoothUnion(d, d3, 0.6);
    return d;
  }

  vec3 calcNormal(vec3 p){
    float e = 0.0015;
    vec2 k = vec2(1.0, -1.0);
    return normalize( k.xyy*map(p + k.xyy*e) +
                      k.yyx*map(p + k.yyx*e) +
                      k.yxy*map(p + k.yxy*e) +
                      k.xxx*map(p + k.xxx*e) );
  }

  void main() {
    vec2 uv = (vUv * 2.0 - 1.0);
    uv.x *= uResolution.x / uResolution.y;

    vec3 ro = vec3(0.0, 0.0, 4.0);
    vec3 rd = normalize(vec3(uv, -1.5));

    float t = 0.0;
    float dist;
    bool hit = false;
    for (int i = 0; i < 100; i++) {
      vec3 p = ro + rd * t;
      dist = map(p);
      if (dist < 0.001) { hit = true; break; }
      t += dist * 0.9;
      if (t > 20.0) break;
    }

    vec3 col = vec3(0.04, 0.06, 0.12);
    if (hit) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      vec3 lightDir = normalize(vec3(0.7, 0.9, 0.2));
      float diff = clamp(dot(n, lightDir), 0.0, 1.0);
      float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
      vec3 base = mix(vec3(0.49,0.51,1.0), vec3(0.62,1.0,0.94), 0.5 + 0.5*sin(uTime*0.7));
      col = base * (0.2 + 0.8*diff) + rim * vec3(0.9, 0.95, 1.0) * 0.7;
    }

    // vignette
    float v = smoothstep(1.2, 0.2, length(uv));
    col *= v;

    gl_FragColor = vec4(col, 1.0);
  }
`

export async function createScene({ renderer, container }) {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const geo = new THREE.PlaneGeometry(2, 2)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uTime: { value: 0 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  })
  const quad = new THREE.Mesh(geo, mat)
  scene.add(quad)

  let running = false
  let rafId = 0
  const clock = new THREE.Clock()

  function resize() {
    mat.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight)
  }

  function tick() {
    if (!running) return
    const t = clock.getElapsedTime()
    mat.uniforms.uTime.value = t
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', resize)

  return {
    start() { running = true; tick() },
    stop() { running = false; cancelAnimationFrame(rafId) },
    dispose() {
      window.removeEventListener('resize', resize)
      geo.dispose(); mat.dispose()
    },
  }
}