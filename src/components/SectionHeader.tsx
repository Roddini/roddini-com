// The "── LABEL ──" divider used above every section on the site.
export default function SectionHeader({
  children,
  className = 'mb-16',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
      <span
        className="text-[10px] tracking-[0.35em] uppercase font-light text-center"
        style={{ color: 'rgba(0,212,170,0.6)' }}
      >
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
    </div>
  )
}
