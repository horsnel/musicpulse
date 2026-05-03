import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About MusicPulse',
  description: 'Learn about MusicPulse — the world\'s music data platform bringing you real-time charts, trending tracks, and artist insights.',
}

export default function AboutPage() {
  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(29,185,84,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-16 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}>
            Our Mission
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            The World's Music Data<br />
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--green)' }}>In One Place</span>
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[600px] leading-relaxed font-medium">
            MusicPulse aggregates charts, trends, releases, and artist data from Spotify, Apple Music, YouTube, TikTok, and more — updated every hour so you never miss a beat.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
          {[
            { label: 'Charts Tracked', value: '200+', sub: 'Countries & regions' },
            { label: 'Data Sources', value: '5', sub: 'Spotify, Apple, YouTube, TikTok, Billboard' },
            { label: 'Updates', value: '24/7', sub: 'Every hour, on the hour' },
            { label: 'Songs Indexed', value: '50M+', sub: 'And growing daily' },
          ].map(stat => (
            <div key={stat.label} className="mp-card p-4 sm:p-6">
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5 sm:mb-2">{stat.label}</div>
              <div className="text-[22px] sm:text-[28px] font-black tracking-[-0.03em] text-[var(--green)]">{stat.value}</div>
              <div className="text-[10px] sm:text-[12px] text-[var(--text3)] mt-0.5 sm:mt-1 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-10 sm:mb-16">
          <h2 className="text-[22px] sm:text-[28px] font-black tracking-[-0.03em] mb-5 sm:mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                step: '01',
                title: 'We Collect',
                desc: 'Our scrapers pull chart data, trending sounds, and release info from public APIs and RSS feeds every hour — covering Spotify, Apple Music, YouTube, TikTok, and Billboard across 200+ regions worldwide.',
                color: 'var(--green)',
              },
              {
                step: '02',
                title: 'We Normalize',
                desc: 'Raw data from different platforms gets cleaned, deduplicated, and normalized into a unified schema. Songs are matched across platforms, chart positions are tracked over time, and cross-platform scores are calculated.',
                color: 'var(--blue)',
              },
              {
                step: '03',
                title: 'You Discover',
                desc: 'Browse real-time charts, discover trending songs before they blow up, explore new releases, and track your favorite artists — all in one beautifully designed interface that updates around the clock.',
                color: 'var(--purple)',
              },
            ].map(item => (
              <div key={item.step} className="mp-card p-5 sm:p-7">
                <div className="text-[42px] font-black tracking-[-0.04em] mb-3" style={{ color: item.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                  {item.step}
                </div>
                <h3 className="text-[18px] font-bold tracking-[-0.02em] mb-3">{item.title}</h3>
                <p className="text-[14px] text-[var(--text3)] leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team / Contact */}
        <div className="mp-card p-6 sm:p-10 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-black tracking-[-0.03em] mb-3">Built by Music Lovers, for Music Lovers</h2>
          <p className="text-[15px] text-[var(--text2)] max-w-[520px] mx-auto leading-relaxed font-medium mb-6">
            MusicPulse is an independent project. We are not affiliated with Spotify, Apple, YouTube, or any other platform. All data is sourced from publicly available APIs and feeds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/charts" className="inline-flex items-center gap-2 bg-[var(--green)] text-black text-[14px] font-bold px-6 py-3 rounded-xl hover:bg-[#1ed760] transition-all no-underline">
              Explore Charts
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            </a>
            <a href="/trending" className="inline-flex items-center gap-2 bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-bold px-6 py-3 rounded-xl hover:border-[var(--text3)] transition-all no-underline">
              See What's Trending
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
