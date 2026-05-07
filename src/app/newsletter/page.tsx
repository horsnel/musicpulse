import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe to the MusicPulse Weekly Charts Digest — top 10 songs, biggest movers, and new releases every Friday.',
}

// Pixabay free-to-use stock images (CC0-like license)
const VINYL_IMAGE = 'https://pixabay.com/get/gd9ba1c55b3ff2ea01dbceeb564ca4a33d2325bb0c3fede0568b023572e7077169c8161548c6e97debe7db2a4395bcef7e7d4ddb7dcb954b8df472fd2b2a6b9d6_1280.jpg'
const STREAMING_IMAGE = 'https://pixabay.com/get/gab1e2c5ece85bcca0fd480cb667e727ff4f5713d12a9284e9ac1d393f618e400c7754bf9d865948f22ce62313618463b3e71ea91cc0f0584aebacdd440d13b01_1280.jpg'
const HEADPHONES_IMAGE = 'https://pixabay.com/get/gcf785f60eba9a2b66ac00a34a00986f714a327e215c5f632e3b07cadacdd84a64142ff3d6066af36b8c24d8f91f3ecb86e876fa8e0664e8d2d23233a4f678f85_1280.jpg'

export default function NewsletterPage() {
  return (
    <div className="relative z-10">
      {/* Hero with vinyl background */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${VINYL_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/85 via-[var(--bg)]/70 to-[var(--bg)]" />
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
        {/* What you get — with stock photo backgrounds */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 sm:mb-16">
          {[
            {
              icon: 'chart',
              title: 'Top 10 Charts',
              desc: 'The biggest songs of the week across Spotify, Apple Music, and YouTube — all ranked and ready.',
              color: 'var(--green)',
              image: STREAMING_IMAGE,
            },
            {
              icon: 'rocket',
              title: 'Biggest Movers',
              desc: 'Which songs surged up the charts and which ones are falling. Track momentum before everyone else.',
              color: 'var(--pink)',
              image: HEADPHONES_IMAGE,
            },
            {
              icon: 'disc',
              title: 'New Releases',
              desc: 'The hottest albums, EPs, and singles that dropped this week — curated so you never miss a thing.',
              color: 'var(--blue)',
              image: VINYL_IMAGE,
            },
          ].map(item => (
            <div key={item.title} className="mp-card overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              {/* Image header */}
              <div
                className="h-[120px] bg-cover bg-center relative"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg2)] via-[var(--bg2)]/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${item.color} 20%, rgba(0,0,0,0.5))`, backdropFilter: 'blur(8px)' }}>
                    <NLICon type={item.icon} color={item.color} />
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2">{item.title}</h3>
                <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sample preview */}
        <div className="mp-card p-8 max-w-[600px] mx-auto relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.05]"
            style={{ backgroundImage: `url(${HEADPHONES_IMAGE})` }}
          />
          <div className="relative z-10">
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
    </div>
  )
}

// SVG icon components
function NLICon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'chart':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="12" width="4" height="9" rx="1" fill={color} opacity="0.7" />
          <rect x="10" y="7" width="4" height="14" rx="1" fill={color} opacity="0.85" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
        </svg>
      )
    case 'rocket':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8 6 6 10 6 14l3 3c4 0 8-2 12-6-4-1-8-5-9-9z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M3 21l4-4M6 18l-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'disc':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="1" fill={color} />
        </svg>
      )
    default:
      return null
  }
}
