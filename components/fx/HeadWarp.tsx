'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import grid from '@/components/fx/face/head-grid.json'

export const YAW_DEG = 10
export const PITCH_DEG = 6
const ROLL_PER_YAW = -0.15
const SHIFT_PER_YAW = 0.015
const HEAD_Z = 0.1
const RELIEF = 0.08
const HEAD_CENTER = { u: 0.57, v: 0.4 }
const NECK_BASE_V = 0.62

// Rotasjonen skjer i vertex-shaderen. Hodet (uLook) og halsen (uNeck, forsinket
// og svakere) får hver sine vinkler, blandet med hvor på hodet vertexet sitter:
// over haken følger det hodet, ned mot kragen følger det halsen. Yaw og roll
// roterer om hodets senter, pitch om nakkebasen. Ved yaw flytter hodet seg
// også litt sideveis, som et ekte hode. Vekten (aWeight) låser kantene.
const headVertexShader = /* glsl */ `
  attribute float aRelief;
  attribute float aWeight;
  uniform vec2 uLook;
  uniform vec2 uNeck;
  uniform vec2 uAngles;
  uniform vec3 uPivot;
  uniform float uPivotPitchY;
  uniform float uHeadZ;
  uniform float uRelief;
  uniform float uShift;
  varying vec2 vUv;

  vec3 turn(vec3 p, vec2 look) {
    float yaw = look.x * uAngles.x;
    float pitch = look.y * uAngles.y;
    float roll = yaw * ${ROLL_PER_YAW.toFixed(2)};
    float cy = cos(yaw), sy = sin(yaw);
    float cp = cos(pitch), sp = sin(pitch);
    float cr = cos(roll), sr = sin(roll);
    vec3 q = p - uPivot;
    q = vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy);
    q = vec3(q.x * cr - q.y * sr, q.x * sr + q.y * cr, q.z);
    q += uPivot;
    q.y -= uPivotPitchY;
    q = vec3(q.x, q.y * cp + q.z * sp, -q.y * sp + q.z * cp);
    q.y += uPivotPitchY;
    q.x += look.x * uShift;
    return q;
  }

  void main() {
    vUv = uv;
    vec3 p = vec3(position.xy, uHeadZ + aRelief * uRelief);
    float headness = 1.0 - smoothstep(0.50, 0.62, 1.0 - uv.y);
    vec3 head = turn(p, uLook);
    vec3 neck = turn(p, uNeck);
    vec2 moved = mix(neck.xy, head.xy, headness);
    vec3 warped = vec3(mix(position.xy, moved, aWeight), 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(warped, 1.0);
  }
`

export type CoverMapping = { scale: [number, number]; offset: [number, number] }

type Props = {
  fragmentShader: string
  uniforms: Record<string, THREE.IUniform>
  cover: CoverMapping
}

export function HeadWarp({ fragmentShader, uniforms, cover }: Props) {
  const mesh = useMemo(() => {
    const [sx, sy] = cover.scale
    const [ox, oy] = cover.offset
    const toPlane = (u: number, vUp: number): [number, number] => [(u - ox) / sx - 0.5, (vUp - oy) / sy - 0.5]
    const { cols, rows, region, relief, weight } = grid
    const n = cols * rows
    const position = new Float32Array(n * 3)
    const uv = new Float32Array(n * 2)
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i
        const u = region.x0 + (i / (cols - 1)) * (region.x1 - region.x0)
        const v = region.y0 + (j / (rows - 1)) * (region.y1 - region.y0)
        const [px, py] = toPlane(u, 1 - v)
        position[k * 3] = px
        position[k * 3 + 1] = py
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

    const [cx, cy] = toPlane(HEAD_CENTER.u, 1 - HEAD_CENTER.v)
    const [, neckY] = toPlane(HEAD_CENTER.u, 1 - NECK_BASE_V)
    const material = new THREE.ShaderMaterial({
      vertexShader: headVertexShader,
      fragmentShader,
      uniforms: {
        ...uniforms,
        uFace: { value: 1 },
        uAngles: { value: new THREE.Vector2(THREE.MathUtils.degToRad(YAW_DEG), THREE.MathUtils.degToRad(PITCH_DEG)) },
        uPivot: { value: new THREE.Vector3(cx, cy, HEAD_Z / sx) },
        uPivotPitchY: { value: neckY },
        uHeadZ: { value: HEAD_Z / sx },
        uRelief: { value: RELIEF / sx },
        uShift: { value: SHIFT_PER_YAW / sx },
      },
    })
    const m = new THREE.Mesh(geometry, material)
    m.position.z = 0.001
    return m
  }, [cover, fragmentShader, uniforms])

  return <primitive object={mesh} />
}
