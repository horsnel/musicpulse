import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertise',
  description: 'Reach millions of music fans with MusicPulse advertising — sponsored placements, newsletter features, and more.',
}

export default function AdvertisePage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[900px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,184,48,0.25)', color: 'var(--gold)' }}>
          Partner With Us
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
          Advertise on MusicPulse
        </h1>
        <p className="text-[14px] sm:text-[17px] text-[var(--text2)] leading-relaxed font-medium mb-14">
          Reach a passionate, engaged audience of music fans, industry professionals, and cultural tastemakers. MusicPulse offers unique sponsorship opportunities across our platform.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {[
            {
              title: 'Sponsored Chart Placement',
              desc: 'Feature your artist or release at the top of our charts and trending sections. Native integration that respects the user experience while driving maximum visibility to your content.',
              icon: '📊',
              color: 'var(--green)',
            },
            {
              title: 'Newsletter Feature',
              desc: 'Reach 12,000+ engaged subscribers in our Weekly Charts Digest. Dedicated placement with click-through tracking and performance analytics included in every campaign.',
              icon: '📧',
              color: 'var(--blue)',
            },
            {
              title: 'Homepage Takeover',
              desc: 'Full-width branded experience on the MusicPulse homepage. Perfect for album launches, tour announcements, or major release campaigns that need maximum impact.',
              icon: '🏠',
              color: 'var(--purple)',
            },
            {
              title: 'Genre & Region Targeting',
              desc: 'Reach specific audiences by genre or geographic region. Target Afrobeats fans in Lagos, K-Pop lovers in Seoul, or Hip-Hop heads in New York — with precision.',
              icon: '🎯',
              color: 'var(--pink)',
            },
          ].map(item => (
            <div key={item.title} className="mp-card p-5 sm:p-7">
              <div className="text-[32px] mb-3">{item.icon}</div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2">{item.title}</h3>
              <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mp-card p-8 text-center">
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
  )
}
