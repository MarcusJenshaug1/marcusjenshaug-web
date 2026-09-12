'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { HeadWarp, type CoverMapping } from '@/components/fx/HeadWarp'
import headGrid from '@/components/fx/face/head-grid.json'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uDepth;
  uniform vec2 uLook;
  uniform float uParallax;
  uniform float uFace;
  uniform sampler2D uEyeMask;
  uniform vec2 uIrisA;
  uniform vec2 uIrisB;
  uniform vec2 uEyeWidth;
  uniform vec2 uEyeShift;

  // Flytter bildet inne i øyeåpningen (maske fra landemerke-polygonene) mot
  // blikkretningen. Vekten er størst ved iris-senteret og null ved øyelokkene,
  // så iris følger pekeren mens lokkene står stille.
  vec2 eyeShift(vec2 uv, vec2 iris, float width, float mask) {
    float r = length((uv - iris) / width);
    float w = mask * smoothstep(0.55, 0.15, r);
    return uLook * uEyeShift * width * w;
  }
  uniform float uTime;
  uniform float uVelocity;
  uniform vec2 uMouse;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform vec2 uCoverFocus;
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

  // object-fit: cover med samme fokuspunkt som stillbildet (50 % 15 % fra toppen),
  // så ansiktet beholdes når boksen er bredere enn bildet.
  vec2 coverUv(vec2 uv) {
    float ratio = uPlaneAspect / uImageAspect;
    vec2 scale = ratio > 1.0 ? vec2(1.0, 1.0 / ratio) : vec2(ratio, 1.0);
    return uv * scale + uCoverFocus * (1.0 - scale);
  }

  void main() {
    // Ansiktsmeshet (uFace = 1) har allerede bilde-uv og er flyttet i geometrien,
    // så det hopper over cover-mapping og dybdeparallakse.
    vec2 uv = uFace > 0.5 ? vUv : coverUv(vUv);

    if (uFace > 0.5) {
      float mask = texture2D(uEyeMask, uv).r;
      uv -= eyeShift(uv, uIrisA, uEyeWidth.x, mask) + eyeShift(uv, uIrisB, uEyeWidth.y, mask);
    } else {
      // Dybdekart: nære piksler flytter seg mot musa, fjerne fra – som om kameraet
      // flytter seg dit pekeren er.
      float depth = smoothstep(0.12, 0.55, texture2D(uDepth, uv).r);
      uv += uLook * uParallax * (depth - 0.5);
      uv = clamp(uv, vec2(0.002), vec2(0.998));
    }

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

const LOOK_EASE = 0.06
const SCROLL_REACH = 0.6
const SCROLL_YAW = 0.35

export type LookInput = 'pointer' | 'scroll'
const PARALLAX_STRENGTH = 0
// Fokuspunkt for cover-beskjæring i uv (y oppover): 50 % / 15 % fra toppen
const COVER_FOCUS = new THREE.Vector2(0.5, 0.85)
// Forskyvning av iris som andel av øyebredden (horisontalt, vertikalt)
const EYE_SHIFT = new THREE.Vector2(0.12, 0.05)
const EYE_MASK_SRC = '/portrett-eyes.png'

function irisUv(eye: { iris: number[] }) {
  return new THREE.Vector2(eye.iris[0], 1 - eye.iris[1])
}

type PortraitPlaneProps = {
  src: string
  depthSrc?: string
  face?: boolean
  input: LookInput
}

function PortraitPlane({ src, depthSrc, face = false, input }: PortraitPlaneProps) {
  const [texture, depthTexture, eyeMask] = useTexture([src, depthSrc ?? src, EYE_MASK_SRC])
  const { viewport, gl } = useThree()
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(0)
  const targetLook = useRef(new THREE.Vector2(0, 0))

  const image = texture.image as { width: number; height: number }
  const cover = useMemo<CoverMapping>(() => {
    const ratio = viewport.width / viewport.height / (image.width / image.height)
    const scale: [number, number] = ratio > 1 ? [1, 1 / ratio] : [ratio, 1]
    return { scale, offset: [COVER_FOCUS.x * (1 - scale[0]), COVER_FOCUS.y * (1 - scale[1])] }
  }, [viewport.width, viewport.height, image.width, image.height])

  useEffect(() => {
    const canvas = gl.domElement

    if (input === 'scroll') {
      // Touch: blikket følger scrollingen. Øverst ser han rett fram, og jo
      // lenger ned du scroller, jo mer ser han ned og litt til siden.
      const onScroll = () => {
        const down = THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * SCROLL_REACH), 0, 1)
        targetLook.current.set(down * SCROLL_YAW, -down)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    // Normaliser mot avstanden til skjermkanten på hver side av portrettet, så
    // venstre kant gir -1 og høyre kant +1 uansett hvor portrettet står.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = cy - e.clientY
      const nx = dx / Math.max(1, dx >= 0 ? window.innerWidth - cx : cx)
      const ny = dy / Math.max(1, dy >= 0 ? cy : window.innerHeight - cy)
      targetLook.current.set(THREE.MathUtils.clamp(nx, -1, 1), THREE.MathUtils.clamp(ny, -1, 1))
    }
    const onLeave = () => targetLook.current.set(0, 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [gl, input])

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    const image = texture.image as { width: number; height: number }
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uDepth: { value: depthTexture },
        uLook: { value: new THREE.Vector2(0, 0) },
        uParallax: { value: depthSrc ? PARALLAX_STRENGTH : 0 },
        uFace: { value: 0 },
        uEyeMask: { value: eyeMask },
        uIrisA: { value: irisUv(headGrid.eyes[0]) },
        uIrisB: { value: irisUv(headGrid.eyes[1]) },
        uEyeWidth: { value: new THREE.Vector2(headGrid.eyes[0].width, headGrid.eyes[1].width) },
        uEyeShift: { value: EYE_SHIFT },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uImageAspect: { value: image.width / image.height },
        uPlaneAspect: { value: 1 },
        uCoverFocus: { value: COVER_FOCUS },
      },
    })
  }, [texture, depthTexture, eyeMask, depthSrc])

  useFrame((_, delta) => {
    const u = material.uniforms
    u.uTime.value += Math.min(delta, 0.1)
    u.uPlaneAspect.value = viewport.width / viewport.height
    ;(u.uMouse.value as THREE.Vector2).lerp(targetMouse.current, 0.08)
    ;(u.uLook.value as THREE.Vector2).lerp(targetLook.current, LOOK_EASE)
    targetVelocity.current *= 0.92
    u.uVelocity.value += (targetVelocity.current - u.uVelocity.value) * 0.1
  })

  return (
    <>
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
      {face && (
        <group scale={[viewport.width, viewport.height, 1]}>
          <HeadWarp fragmentShader={fragmentShader} uniforms={material.uniforms} cover={cover} />
        </group>
      )}
    </>
  )
}

type HeroSceneProps = {
  src: string
  depthSrc?: string
  face?: boolean
  input?: LookInput
  paused?: boolean
  onContextLost?: () => void
}

export default function HeroScene({
  src,
  depthSrc,
  face = false,
  input = 'pointer',
  paused = false,
  onContextLost,
}: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      resize={{ scroll: false, debounce: 0, offsetSize: true }}
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
      <Suspense fallback={null}>
        <PortraitPlane src={src} depthSrc={depthSrc} face={face} input={input} />
      </Suspense>
    </Canvas>
  )
}
