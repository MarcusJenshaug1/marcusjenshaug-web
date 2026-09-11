'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import grid from '@/components/fx/face/head-grid.json'

const YAW_DEG = 10
const PITCH_DEG = 6
const PIVOT_Z = 0.1
const HEAD_Z = 0.1
const RELIEF = 0.08

// Rotasjonen skjer i vertex-shaderen: hvert vertex har relieff (aRelief, 0–1 fra
// dybdekartet) og vekt (aWeight, 1 i hodet, 0 ved kanten). Vertexet løftes til
// z = HEAD_Z + relieff·RELIEF, roteres om et pivot bak hodet og blandes tilbake
// mot basisposisjonen med vekten, så kantene ligger fast. uv følger basis.
const headVertexShader = /* glsl */ `
  attribute float aRelief;
  attribute float aWeight;
  uniform vec2 uLook;
  uniform vec2 uAngles;
  uniform vec3 uPivot;
  uniform float uHeadZ;
  uniform float uRelief;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float yaw = uLook.x * uAngles.x;
    float pitch = uLook.y * uAngles.y;
    vec3 p = vec3(position.xy, uHeadZ + aRelief * uRelief) - uPivot;
    float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
    vec3 r = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
    r = vec3(r.x, r.y * cp + r.z * sp, -r.y * sp + r.z * cp);
    vec2 moved = (r + uPivot).xy;
    vec3 warped = vec3(mix(position.xy, moved, aWeight), 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(warped, 1.0);
  }
`

type Props = {
  fragmentShader: string
  uniforms: Record<string, THREE.IUniform>
  scale: [number, number]
}

export function HeadWarp({ fragmentShader, uniforms, scale }: Props) {
  const mesh = useMemo(() => {
    const [sx, sy] = scale
    const { cols, rows, region, relief, weight } = grid
    const n = cols * rows
    const position = new Float32Array(n * 3)
    const uv = new Float32Array(n * 2)
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i
        const u = region.x0 + (i / (cols - 1)) * (region.x1 - region.x0)
        const v = region.y0 + (j / (rows - 1)) * (region.y1 - region.y0)
        position[k * 3] = (u - 0.5) / sx
        position[k * 3 + 1] = (0.5 - v) / sy
        uv[k * 2] = u
        uv[k * 2 + 1] = 1 - v
      }
    }
    const index: number[] = []
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = j * cols + i
        index.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    geometry.setAttribute('aRelief', new THREE.BufferAttribute(new Float32Array(relief), 1))
    geometry.setAttribute('aWeight', new THREE.BufferAttribute(new Float32Array(weight), 1))
    geometry.setIndex(index)

    const center = new THREE.Vector3((0.57 - 0.5) / sx, (0.5 - 0.4) / sy, -PIVOT_Z / sx)
    const material = new THREE.ShaderMaterial({
      vertexShader: headVertexShader,
      fragmentShader,
      uniforms: {
        ...uniforms,
        uFace: { value: 1 },
        uAngles: { value: new THREE.Vector2(THREE.MathUtils.degToRad(YAW_DEG), THREE.MathUtils.degToRad(PITCH_DEG)) },
        uPivot: { value: center },
        uHeadZ: { value: HEAD_Z / sx },
        uRelief: { value: RELIEF / sx },
      },
    })
    const m = new THREE.Mesh(geometry, material)
    m.position.z = 0.001
    return m
  }, [scale, fragmentShader, uniforms])

  return <primitive object={mesh} />
}
