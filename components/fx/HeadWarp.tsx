'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import grid from '@/components/fx/face/head-grid.json'

const YAW_DEG = 10
const PITCH_DEG = 6
const PIVOT_Z = -0.1
const HEAD_Z = 0.12
const RELIEF = 2.5
const HEAD_MID = 0.44

type Props = {
  vertexShader: string
  fragmentShader: string
  uniforms: Record<string, THREE.IUniform>
  scale: [number, number]
  look: THREE.Vector2
}

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export function HeadWarp({ vertexShader, fragmentShader, uniforms, scale, look }: Props) {
  const built = useMemo(() => {
    const [sx, sy] = scale
    const { cols, rows, region, ellipse, inner, depth } = grid
    const n = cols * rows
    const base = new Float32Array(n * 3)
    const uv = new Float32Array(n * 2)
    const weight = new Float32Array(n)
    const relief = new Float32Array(n)

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i
        const u = region.x0 + (i / (cols - 1)) * (region.x1 - region.x0)
        const v = region.y0 + (j / (rows - 1)) * (region.y1 - region.y0)
        base[k * 3] = (u - 0.5) / sx
        base[k * 3 + 1] = (0.5 - v) / sy
        uv[k * 2] = u
        uv[k * 2 + 1] = 1 - v

        const ex = (u - ellipse.cx) / ellipse.rx
        const ey = (v - ellipse.cy) / (v < ellipse.cy ? ellipse.ryTop : ellipse.ryBottom)
        weight[k] = smooth((1 - Math.hypot(ex, ey)) / (1 - inner))

        const d = depth[k]
        const head = smooth((d - 0.25) / 0.25)
        relief[k] = (head * (HEAD_Z + (d - HEAD_MID) * RELIEF)) / sx
      }
    }

    const index: number[] = []
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = j * cols + i
        const b = a + 1
        const c = a + cols
        const d = c + 1
        index.push(a, c, b, b, c, d)
      }
    }

    const position = new THREE.BufferAttribute(new Float32Array(base), 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', position)
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    geometry.setIndex(index)

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...uniforms, uFace: { value: 1 } },
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.z = 0.001

    const cx = (ellipse.cx - 0.5) / sx
    const cy = (0.5 - ellipse.cy) / sy
    return { mesh, position, base, weight, relief, cx, cy, n }
  }, [scale, vertexShader, fragmentShader, uniforms])

  useFrame(() => {
    const { position, base, weight, relief, cx, cy, n } = built
    const yaw = THREE.MathUtils.degToRad(look.x * YAW_DEG)
    const pitch = THREE.MathUtils.degToRad(look.y * PITCH_DEG)
    const cosY = Math.cos(yaw)
    const sinY = Math.sin(yaw)
    const cosP = Math.cos(pitch)
    const sinP = Math.sin(pitch)
    const out = position.array as Float32Array
    for (let i = 0; i < n; i++) {
      const x = base[i * 3] - cx
      const y = base[i * 3 + 1] - cy
      const z = relief[i] - PIVOT_Z
      const x1 = x * cosY + z * sinY
      const z1 = -x * sinY + z * cosY
      const y1 = y * cosP + z1 * sinP
      const w = weight[i]
      out[i * 3] = cx + x + (x1 - x) * w
      out[i * 3 + 1] = cy + y + (y1 - y) * w
    }
    position.needsUpdate = true
  })

  return <primitive object={built.mesh} />
}
