export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="ambient-blob"
        style={{
          width: 700, height: 700,
          background: '#1DB954',
          opacity: 0.06,
          top: -200, left: -100,
          animationDuration: '22s',
        }}
      />
      <div
        className="ambient-blob"
        style={{
          width: 500, height: 500,
          background: '#ff2d6b',
          opacity: 0.05,
          top: '30%', right: -150,
          animationDuration: '28s',
          animationDelay: '-7s',
        }}
      />
      <div
        className="ambient-blob"
        style={{
          width: 400, height: 400,
          background: '#4361ff',
          opacity: 0.04,
          bottom: '10%', left: '20%',
          animationDuration: '34s',
          animationDelay: '-14s',
        }}
      />
    </div>
  )
}
