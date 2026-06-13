'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { gsap } from '@/lib/motion/gsap'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;
  uniform float uVelocity;
  uniform float uAspectA;
  uniform float uAspectB;
  varying vec2 vUv;

  const float PLANE_ASPECT = 1.5;

  vec2 coverUv(vec2 uv, float imageAspect) {
    float ratio = PLANE_ASPECT / imageAspect;
    vec2 scale = ratio > 1.0 ? vec2(1.0, 1.0 / ratio) : vec2(ratio, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float skew = uVelocity * (uv.y - 0.5) * 0.25;
    uv.x += skew;

    float wave = sin(uv.y * 8.0 + uProgress * 5.0) * 0.04 * (1.0 - abs(uProgress * 2.0 - 1.0));
    vec2 uvA = coverUv(uv + vec2(wave, uProgress * 0.15), uAspectA);
    vec2 uvB = coverUv(uv + vec2(wave, -(1.0 - uProgress) * 0.15), uAspectB);

    vec4 colA = texture2D(uTexA, uvA);
    vec4 colB = texture2D(uTexB, uvB);
    gl_FragColor = mix(colA, colB, smoothstep(0.1, 0.9, uProgress));
  }
`

export type PreviewItem = {
  key: string
  src: string | null
  title: string
  index: number
}

function makeTypographicTile(title: string, index: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const styles = getComputedStyle(document.documentElement)
    const bg = styles.getPropertyValue('--bg-sunken').trim() || '#1a1713'
    const ink = styles.getPropertyValue('--ink').trim() || '#f2efe9'
    const accent = styles.getPropertyValue('--accent').trim() || '#ff5c1f'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 600, 400)
    ctx.fillStyle = accent
    ctx.font = '500 20px monospace'
    ctx.fillText(`00${index + 1}`, 36, 60)
    ctx.fillStyle = ink
    ctx.font = '700 44px monospace'
    const words = title.toUpperCase().split(' ')
    words.forEach((word, i) => ctx.fillText(word, 36, 160 + i * 56))
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function aspectOf(tex: THREE.Texture): number {
  const img = tex.image as { width?: number; height?: number } | undefined
  return img?.width && img?.height ? img.width / img.height : 1.5
}

function PreviewPlane({
  items,
  activeIndex,
  drawing,
}: {
  items: PreviewItem[]
  activeIndex: number
  drawing: boolean
}) {
  const textures = useRef<(THREE.Texture | null)[]>([])
  const displayedTex = useRef<THREE.Texture | null>(null)
  const target = useRef(-1)
  const velocity = useRef(0)
  const lastX = useRef(0)
  const [tick, setTick] = useState(0)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexA: { value: null },
          uTexB: { value: null },
          uProgress: { value: 0 },
          uVelocity: { value: 0 },
          uAspectA: { value: 1.5 },
          uAspectB: { value: 1.5 },
        },
      }),
    []
  )

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const store = (i: number, texture: THREE.Texture) => {
      textures.current[i] = texture
      setTick((t) => t + 1)
    }
    items.forEach((item, i) => {
      const useTile = () => store(i, makeTypographicTile(item.title, item.index))
      if (!item.src) {
        useTile()
        return
      }
      loader.load(
        item.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          store(i, texture)
        },
        undefined,
        useTile
      )
    })
    const loaded = textures.current
    return () => loaded.forEach((t) => t?.dispose())
  }, [items])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      velocity.current = THREE.MathUtils.clamp((e.clientX - lastX.current) * 0.01, -1, 1)
      lastX.current = e.clientX
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const tex = textures.current[activeIndex]
    if (!tex) return
    if (target.current === activeIndex) return
    const u = material.uniforms
    const a = aspectOf(tex)
    if (!displayedTex.current) {
      u.uTexA.value = tex
      u.uAspectA.value = a
      u.uProgress.value = 0
      displayedTex.current = tex
      target.current = activeIndex
      return
    }
    u.uTexA.value = displayedTex.current
    u.uAspectA.value = aspectOf(displayedTex.current)
    u.uTexB.value = tex
    u.uAspectB.value = a
    target.current = activeIndex
    const committed = tex
    const committedIndex = activeIndex
    gsap.fromTo(
      u.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          if (target.current !== committedIndex) return
          displayedTex.current = committed
          u.uTexA.value = committed
          u.uAspectA.value = aspectOf(committed)
          u.uProgress.value = 0
        },
      }
    )
  }, [activeIndex, material, tick])

  useEffect(() => {
    if (drawing) return
    velocity.current = 0
    material.uniforms.uVelocity.value = 0
  }, [drawing, material])

  useFrame(() => {
    velocity.current *= 0.9
    const u = material.uniforms
    u.uVelocity.value += (velocity.current - u.uVelocity.value) * 0.12
  })

  return (
    <mesh scale={[3, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

type HoverPreviewProps = {
  items: PreviewItem[]
  activeIndex: number | null
  focusPoint: { x: number; y: number } | null
}

export function HoverPreview({ items, activeIndex, focusPoint }: HoverPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lastActive = useRef(0)
  const placeRef = useRef<((x: number, y: number) => void) | null>(null)
  const [drawing, setDrawing] = useState(true)
  const visible = activeIndex !== null

  if (visible) lastActive.current = activeIndex

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const style = getComputedStyle(el)
    const offsetX = parseFloat(style.left) || 0
    const offsetY = parseFloat(style.top) || 0
    const place = (x: number, y: number) => {
      const edge = 16
      const minX = edge - offsetX
      const minY = edge - offsetY
      const maxX = window.innerWidth - edge - offsetX - el.offsetWidth
      const maxY = window.innerHeight - edge - offsetY - el.offsetHeight
      xTo(Math.min(Math.max(x, minX), Math.max(minX, maxX)))
      yTo(Math.min(Math.max(y, minY), Math.max(minY, maxY)))
    }
    placeRef.current = place
    const onMove = (e: PointerEvent) => place(e.clientX, e.clientY)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    if (!focusPoint) return
    placeRef.current?.(focusPoint.x, focusPoint.y)
  }, [focusPoint])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    if (visible) {
      setDrawing(true)
      gsap.to(el, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power3.out', overwrite: true })
    } else {
      gsap.to(el, {
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => setDrawing(false),
      })
    }
  }, [visible])

  return (
    <div ref={wrapperRef} className="hover-preview" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={drawing ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 2], fov: 50 }}
      >
        <PreviewPlane items={items} activeIndex={activeIndex ?? lastActive.current} drawing={drawing} />
      </Canvas>
    </div>
  )
}
