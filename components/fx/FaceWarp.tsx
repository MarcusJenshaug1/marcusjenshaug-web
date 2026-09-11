'use client'

import { useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import landmarks from '@/components/fx/face/landmarks.json'
import triangulation from '@/components/fx/face/triangulation.json'

const YAW_DEG = 12
const PITCH_DEG = 8
const DEPTH = 1.6
const PIVOT_Z = -0.08
const INNER = 0.5
const LINE_IDLE = 0.3
const LINE_HOVER = 0.6
const LINE_COLOR = 0xf07a3e
const POINT_COLOR = 0xffb08a

type Props = {
  vertexShader: string
  fragmentShader: string
  uniforms: Record<string, THREE.IUniform>
  scale: [number, number]
  parallax: number
  look: THREE.Vector2
  hover: MutableRefObject<boolean>
}

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export function FaceWarp({ vertexShader, fragmentShader, uniforms, scale, parallax, look, hover }: Props) {
  const built = useMemo(() => {
    const [sx, sy] = scale
    const n = landmarks.points.length
    const base = new Float32Array(n * 3)
    const uv = new Float32Array(n * 2)
    let cx = 0
    let cy = 0
    landmarks.points.forEach(([x, y, z], i) => {
      base[i * 3] = (x - 0.5) / sx
      base[i * 3 + 1] = (0.5 - y) / sy
      base[i * 3 + 2] = (-z * DEPTH) / sx
      uv[i * 2] = x
      uv[i * 2 + 1] = 1 - y
      cx += base[i * 3]
      cy += base[i * 3 + 1]
    })
    cx /= n
    cy /= n
    let radius = 0
    for (let i = 0; i < n; i++) radius = Math.max(radius, Math.hypot(base[i * 3] - cx, base[i * 3 + 1] - cy))
    const weight = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const r = Math.hypot(base[i * 3] - cx, base[i * 3 + 1] - cy) / radius
      weight[i] = smooth((1 - r) / (1 - INNER))
    }

    const position = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
    const faceGeometry = new THREE.BufferGeometry()
    faceGeometry.setAttribute('position', position)
    faceGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    faceGeometry.setIndex(triangulation)

    const edges = new Set<number>()
    for (let i = 0; i < triangulation.length; i += 3) {
      const tri = [triangulation[i], triangulation[i + 1], triangulation[i + 2]]
      for (let k = 0; k < 3; k++) {
        const a = tri[k]
        const b = tri[(k + 1) % 3]
        edges.add(a < b ? a * 1000 + b : b * 1000 + a)
      }
    }
    const edgeIndex: number[] = []
    edges.forEach((e) => edgeIndex.push(Math.floor(e / 1000), e % 1000))
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', position)
    lineGeometry.setIndex(edgeIndex)
    const pointGeometry = new THREE.BufferGeometry()
    pointGeometry.setAttribute('position', position)

    const faceMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...uniforms, uFace: { value: 1 } },
    })
    const lineMaterial = new THREE.LineBasicMaterial({
      color: LINE_COLOR,
      transparent: true,
      opacity: LINE_IDLE,
      depthTest: false,
    })
    const pointMaterial = new THREE.PointsMaterial({
      color: POINT_COLOR,
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: LINE_IDLE * 1.5,
      depthTest: false,
    })

    const group = new THREE.Group()
    const face = new THREE.Mesh(faceGeometry, faceMaterial)
    face.position.z = 0.001
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    lines.position.z = 0.002
    lines.renderOrder = 2
    const points = new THREE.Points(pointGeometry, pointMaterial)
    points.position.z = 0.003
    points.renderOrder = 3
    group.add(face, lines, points)

    return { group, position, base, weight, cx, cy, n, lineMaterial, pointMaterial }
  }, [scale, vertexShader, fragmentShader, uniforms])

  useFrame(() => {
    const { position, base, weight, cx, cy, n, lineMaterial, pointMaterial } = built
    const yaw = THREE.MathUtils.degToRad(look.x * YAW_DEG)
    const pitch = THREE.MathUtils.degToRad(look.y * PITCH_DEG)
    const cosY = Math.cos(yaw)
    const sinY = Math.sin(yaw)
    const cosP = Math.cos(pitch)
    const sinP = Math.sin(pitch)
    const shiftX = (-look.x * parallax * 0.5) / scale[0]
    const shiftY = (-look.y * parallax * 0.5) / scale[1]
    const out = position.array as Float32Array
    for (let i = 0; i < n; i++) {
      const x = base[i * 3] - cx
      const y = base[i * 3 + 1] - cy
      const z = base[i * 3 + 2] - PIVOT_Z
      const x1 = x * cosY + z * sinY
      const z1 = -x * sinY + z * cosY
      const y1 = y * cosP + z1 * sinP
      const w = weight[i]
      out[i * 3] = cx + x + (x1 - x) * w + shiftX
      out[i * 3 + 1] = cy + y + (y1 - y) * w + shiftY
      out[i * 3 + 2] = 0
    }
    position.needsUpdate = true

    const target = hover.current ? LINE_HOVER : LINE_IDLE
    lineMaterial.opacity += (target - lineMaterial.opacity) * 0.08
    pointMaterial.opacity = lineMaterial.opacity * 1.5
  })

  return <primitive object={built.group} />
}
