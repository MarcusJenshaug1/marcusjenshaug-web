import * as THREE from 'three'

// Blikkmodell: øynene reagerer først (rask demping, saccade ved raske bevegelser),
// hodet følger med en lett underdempet fjær, halsen følger hodet tregest.
// Idle-støy legges på målet når musa står stille, og etter noen sekunder uten
// bevegelse glir alt mot nesten-nøytral. Alt er tidsbasert, ikke per frame.

const EYE_TAU = 0.08
const EYE_TAU_FAST = 0.03
const SACCADE_SPEED = 3
const HEAD_OMEGA = 9
const HEAD_ZETA = 0.75
const NECK_TAU = 0.3
const NECK_FOLLOW = 0.3
const EYE_VOR = 0.6
const DEADZONE = 0.02
const BORED_AFTER = 4
const BORED_OVER = 3
const MAX_DT = 0.05

function hash(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

function noise(x: number) {
  const i = Math.floor(x)
  const f = x - i
  const t = f * f * (3 - 2 * f)
  return hash(i) * (1 - t) + hash(i + 1) * t
}

function damp(current: THREE.Vector2, target: THREE.Vector2, tau: number, dt: number) {
  const k = 1 - Math.exp(-dt / tau)
  current.x += (target.x - current.x) * k
  current.y += (target.y - current.y) * k
}

export class Gaze {
  readonly eyes = new THREE.Vector2()
  readonly head = new THREE.Vector2()
  readonly neck = new THREE.Vector2()
  readonly eyesLocal = new THREE.Vector2()

  private readonly headVel = new THREE.Vector2()
  private readonly prev = new THREE.Vector2()
  private readonly goal = new THREE.Vector2()
  private readonly eyeGoal = new THREE.Vector2()
  private readonly neckGoal = new THREE.Vector2()
  private time = 0
  private lastMove = 0

  update(rawDt: number, target: THREE.Vector2) {
    const dt = Math.min(rawDt, MAX_DT)
    this.time += dt

    const speed = this.prev.distanceTo(target) / Math.max(dt, 1e-4)
    if (speed > DEADZONE) this.lastMove = this.time
    this.prev.copy(target)

    const bored = THREE.MathUtils.clamp((this.time - this.lastMove - BORED_AFTER) / BORED_OVER, 0, 1)
    const t = this.time
    const calm = 1 - Math.min(1, speed / 0.5)
    const idleX = (noise(t * 0.15) * 0.06 + noise(t * 0.4 + 10) * 0.02) * calm
    const idleY = (noise(t * 0.12 + 20) * 0.04 + Math.sin(t * Math.PI * 2 * 0.28) * 0.015) * calm

    this.goal.set(target.x * (1 - bored * 0.8) + idleX, target.y * (1 - bored * 0.8) + idleY)

    const saccade = speed > SACCADE_SPEED
    this.eyeGoal.copy(this.goal)
    if (saccade) this.eyeGoal.lerpVectors(this.eyes, this.goal, 0.9)
    damp(this.eyes, this.eyeGoal, saccade ? EYE_TAU_FAST : EYE_TAU, dt)

    const ax = HEAD_OMEGA * HEAD_OMEGA * (this.goal.x - this.head.x) - 2 * HEAD_ZETA * HEAD_OMEGA * this.headVel.x
    const ay = HEAD_OMEGA * HEAD_OMEGA * (this.goal.y - this.head.y) - 2 * HEAD_ZETA * HEAD_OMEGA * this.headVel.y
    this.headVel.x += ax * dt
    this.headVel.y += ay * dt
    this.head.x += this.headVel.x * dt
    this.head.y += this.headVel.y * dt

    this.neckGoal.copy(this.head).multiplyScalar(NECK_FOLLOW)
    damp(this.neck, this.neckGoal, NECK_TAU, dt)

    this.eyesLocal.set(this.eyes.x - this.head.x * EYE_VOR, this.eyes.y - this.head.y * EYE_VOR)
  }
}
