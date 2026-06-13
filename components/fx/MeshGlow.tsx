type MeshGlowProps = {
  className?: string
}

export function MeshGlow({ className }: MeshGlowProps) {
  return (
    <div aria-hidden className={`mesh-glow${className ? ` ${className}` : ''}`}>
      <div className="mesh-glow-blob mesh-glow-a" />
      <div className="mesh-glow-blob mesh-glow-b" />
    </div>
  )
}
