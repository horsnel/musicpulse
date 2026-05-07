import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe to the MusicPulse Weekly Charts Digest — top 10 songs, biggest movers, and new releases every Friday.',
}

export default function NewsletterPage() {
  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 40% 40%, rgba(29,185,84,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-[720px] mx-auto px-4 sm:px-7 pt-24 pb-10 sm:pb-20 relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#0d8c3d] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" stroke="#000" strokeWidth="2" fill="none" />
              <polyline points="2,6 14,16 26,6" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Weekly Charts Digest
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] leading-relaxed font-medium mb-8">
            Get the top 10 songs, biggest chart movers, and freshest new releases delivered to your inbox every Friday. No spam, just the music that matters.
          </p>

          {/* Signup form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-[440px] mx-auto mb-6 sm:mb-10">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-medium px-5 py-3.5 rounded-xl outline-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--text3)]"
            />
            <button className="flex items-center gap-2 bg-[var(--green)] text-black text-[14px] font-bold px-7 py-3.5 rounded-xl hover:bg-[#1ed760] transition-all whitespace-nowrap">
              Subscribe Free
            </button>
          </div>

          <p className="text-[12px] text-[var(--text3)] font-medium">
            Delivered every Friday · Unsubscribe anytime · Join 12,000+ music fans
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        {/* What you get */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 sm:mb-16">
          {[
            {
              icon: 'chart',
              title: 'Top 10 Charts',
              desc: 'The biggest songs of the week across Spotify, Apple Music, and YouTube — all ranked and ready.',
              color: 'var(--green)',
            },
            {
              icon: 'rocket',
              title: 'Biggest Movers',
              desc: 'Which songs surged up the charts and which ones are falling. Track momentum before everyone else.',
              color: 'var(--pink)',
            },
            {
              icon: 'disc',
              title: 'New Releases',
              desc: 'The hottest albums, EPs, and singles that dropped this week — curated so you never miss a thing.',
              color: 'var(--blue)',
            },
          ].map(item => (
            <div key={item.title} className="mp-card p-5 sm:p-7 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                <NLICon type={item.icon} color={item.color} />
              </div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2">{item.title}</h3>
              <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Sample preview */}
        <div className="mp-card p-8 max-w-[600px] mx-auto">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--text3)] mb-4">
            Preview — Issue #47 · Apr 25, 2025
          </div>
          <div className="border-b border-[var(--border)] pb-4 mb-4">
            <div className="text-[18px] font-black tracking-[-0.03em] mb-1">This Week's #1</div>
            <div className="text-[14px] text-[var(--text2)] font-medium">Die With A Smile — Lady Gaga, Bruno Mars</div>
            <div className="text-[12px] text-[var(--green)] font-bold mt-1">12.4M streams · 24 weeks on chart</div>
          </div>
          <div className="border-b border-[var(--border)] pb-4 mb-4">
            <div className="text-[14px] font-bold mb-2">Biggest Mover</div>
            <div className="text-[13px] text-[var(--text2)] font-medium">luther — Kendrick Lamar, SZA ↑ 18 positions</div>
          </div>
          <div>
            <div className="text-[14px] font-bold mb-2">Fresh Drops</div>
            <div className="text-[13px] text-[var(--text2)] font-medium">GNX (Kendrick Lamar) · Rosie (Rose) · luther (Kendrick Lamar, SZA)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// SVG icon components replacing emojis
function NLICon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'chart':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="12" width="4" height="9" rx="1" fill={color} opacity="0.7" />
          <rect x="10" y="7" width="4" height="14" rx="1" fill={color} opacity="0.85" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
        </svg>
      )
    case 'rocket':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8 6 6 10 6 14l3 3c4 0 8-2 12-6-4-1-8-5-9-9z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M3 21l4-4M6 18l-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'disc':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="1" fill={color} />
        </svg>
      )
    default:
      return null
  }
}
