export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-8" style={{ background: '#060a13', color: 'white' }}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </div>
  )
}
