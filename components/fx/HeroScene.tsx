'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uVelocity;
  uniform vec2 uMouse;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  varying vec2 vUv;

  // Simplex-stoy (Ashima / Ian McEwan)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec2 coverUv(vec2 uv) {
    float ratio = uPlaneAspect / uImageAspect;
    vec2 scale = ratio > 1.0 ? vec2(1.0, 1.0 / ratio) : vec2(ratio, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);

    float drift = snoise(uv * 2.4 + uTime * 0.12) * 0.006;
    float dist = distance(vUv, uMouse);
    float ripple = smoothstep(0.45, 0.0, dist) * uVelocity;
    float n = snoise(uv * 5.0 + uTime * 0.4);

    vec2 offset = vec2(drift + ripple * n * 0.08, drift + ripple * n * 0.06);

    float shift = ripple * 0.012 + 0.0015;
    float r = texture2D(uTexture, uv + offset + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, uv + offset).g;
    float b = texture2D(uTexture, uv + offset - vec2(shift, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

function PortraitPlane({ src }: { src: string }) {
  const texture = useTexture(src)
  const { viewport } = useThree()
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(0)

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    const image = texture.image as { width: number; height: number }
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uImageAspect: { value: image.width / image.height },
        uPlaneAspect: { value: 1 },
      },
    })
  }, [texture])

  useFrame((_, delta) => {
    const u = material.uniforms
    u.uTime.value += delta
    u.uPlaneAspect.value = viewport.width / viewport.height
    ;(u.uMouse.value as THREE.Vector2).lerp(targetMouse.current, 0.08)
    targetVelocity.current *= 0.92
    u.uVelocity.value += (targetVelocity.current - u.uVelocity.value) * 0.1
  })

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={(e) => {
        if (!e.uv) return
        const prev = targetMouse.current.clone()
        targetMouse.current.set(e.uv.x, e.uv.y)
        targetVelocity.current = Math.min(
          targetVelocity.current + prev.distanceTo(targetMouse.current) * 6,
          1.2
        )
      }}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

type HeroSceneProps = {
  src: string
  paused?: boolean
  onContextLost?: () => void
}

export default function HeroScene({ src, paused = false, onContextLost }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={paused ? 'never' : 'always'}
      gl={{ antialias: false, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 1], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost?.()
        })
      }}
    >
      <PortraitPlane src={src} />
    </Canvas>
  )
}
