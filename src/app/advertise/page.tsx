import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertise',
  description: 'Reach millions of music fans with MusicPulse advertising — sponsored placements, newsletter features, and more.',
}

// Pixabay free-to-use stock images (CC0-like license)
const HERO_IMAGE = 'https://pixabay.com/get/g46c1899dab3ecaa24be491b943b5524ac5cb633cc347a697f48272074f5830858c9b2792c4cb22ccab87ceb01ff737c8e372ea0353392e2075d9fbf513ece5a0_1280.jpg'
const CONCERT_IMAGE = 'https://pixabay.com/get/g3a4301b8dc89bdc8b324bd6c22d049e8705b9022ec9cf2eb3e0dddf30793d202f2e5a28b9915a7b83bb058abbc3e6b5c16eaaf1ffb6f1c4824d3c8785b839069_1280.jpg'
const HEADPHONES_IMAGE = 'https://pixabay.com/get/gcf785f60eba9a2b66ac00a34a00986f714a327e215c5f632e3b07cadacdd84a64142ff3d6066af36b8c24d8f91f3ecb86e876fa8e0664e8d2d23233a4f678f85_1280.jpg'

export default function AdvertisePage() {
  return (
    <div className="relative z-10">
      {/* Hero with concert background image */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/80 via-[var(--bg)]/60 to-[var(--bg)]" />
        <div className="max-w-[900px] mx-auto px-4 sm:px-7 pt-16 sm:pt-24 pb-12 sm:pb-16 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,184,48,0.25)', color: 'var(--gold)' }}>
            Partner With Us
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Advertise on MusicPulse
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[600px] leading-relaxed font-medium">
            Reach a passionate, engaged audience of music fans, industry professionals, and cultural tastemakers. MusicPulse offers unique sponsorship opportunities across our platform.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {[
            {
              title: 'Sponsored Chart Placement',
              desc: 'Feature your artist or release at the top of our charts and trending sections. Native integration that respects the user experience while driving maximum visibility to your content.',
              icon: 'chart',
              color: 'var(--green)',
              image: CONCERT_IMAGE,
            },
            {
              title: 'Newsletter Feature',
              desc: 'Reach 12,000+ engaged subscribers in our Weekly Charts Digest. Dedicated placement with click-through tracking and performance analytics included in every campaign.',
              icon: 'mail',
              color: 'var(--blue)',
              image: HEADPHONES_IMAGE,
            },
            {
              title: 'Homepage Takeover',
              desc: 'Full-width branded experience on the MusicPulse homepage. Perfect for album launches, tour announcements, or major release campaigns that need maximum impact.',
              icon: 'home',
              color: 'var(--purple)',
              image: HERO_IMAGE,
            },
            {
              title: 'Genre & Region Targeting',
              desc: 'Reach specific audiences by genre or geographic region. Target Afrobeats fans in Lagos, K-Pop lovers in Seoul, or Hip-Hop heads in New York — with precision.',
              icon: 'target',
              color: 'var(--pink)',
              image: CONCERT_IMAGE,
            },
          ].map(item => (
            <div key={item.title} className="mp-card overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              {/* Feature image */}
              <div
                className="h-[140px] bg-cover bg-center relative"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg2)] via-[var(--bg2)]/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${item.color} 20%, rgba(0,0,0,0.5))`, backdropFilter: 'blur(8px)' }}>
                    <AdIcon type={item.icon} color={item.color} />
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

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-4 mb-14">
          {[
            { label: 'Monthly Visitors', value: '2M+', color: 'var(--green)' },
            { label: 'Newsletter Subs', value: '12K+', color: 'var(--blue)' },
            { label: 'Avg. Session Time', value: '4.5 min', color: 'var(--purple)' },
          ].map(stat => (
            <div key={stat.label} className="mp-card p-5 text-center">
              <div className="text-[28px] sm:text-[32px] font-black tracking-[-0.03em] mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[12px] text-[var(--text3)] font-semibold tracking-[0.04em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mp-card p-8 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
            style={{ backgroundImage: `url(${CONCERT_IMAGE})` }}
          />
          <div className="relative z-10">
            <h2 className="text-[22px] font-black tracking-[-0.03em] mb-3">Ready to Get Started?</h2>
            <p className="text-[14px] text-[var(--text2)] max-w-[440px] mx-auto leading-relaxed font-medium mb-6">
              We offer flexible packages for labels, independent artists, and brands. Get in touch and we will craft a campaign that fits your goals and budget.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-[var(--green)] text-black text-[14px] font-bold px-6 py-3 rounded-xl hover:bg-[#1ed760] transition-all no-underline">
              Contact Our Team
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// SVG icon components
function AdIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'chart':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="12" width="4" height="9" rx="1" fill={color} opacity="0.7" />
          <rect x="10" y="7" width="4" height="14" rx="1" fill={color} opacity="0.85" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
        </svg>
      )
    case 'mail':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
          <path d="M2 7l10 7 10-7" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'home':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L12 3l9 9" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'target':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </svg>
      )
    default:
      return null
  }
}
