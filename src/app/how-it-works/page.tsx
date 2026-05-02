import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how MusicPulse collects, normalizes, and delivers real-time music chart data from around the world.',
}

export default function HowItWorksPage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[900px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}>
          Under the Hood
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
          How MusicPulse Works
        </h1>
        <p className="text-[14px] sm:text-[17px] text-[var(--text2)] leading-relaxed font-medium mb-14">
          From raw data to beautiful charts — here is how we bring the world's music data together in one place, updated every hour.
        </p>

        <div className="space-y-12">
          {[
            {
              step: '1',
              title: 'Data Collection',
              color: 'var(--green)',
              desc: 'Our Cloudflare Workers run on automated cron schedules — every hour for charts and every 2 hours for trending data. They fetch from public APIs and RSS feeds including Spotify Charts CSV endpoints, Apple Music RSS feeds, YouTube Data API, and the TikTok Creative Center. No private APIs or authentication tokens are required for any of these sources — everything is publicly accessible.',
              details: [
                'Spotify: Regional daily chart data via public JSON endpoints',
                'Apple Music: Top 100 RSS feeds by country',
                'YouTube: Most popular music videos via Data API',
                'TikTok: Trending sounds from the Creative Center API',
              ],
            },
            {
              step: '2',
              title: 'Normalization & Matching',
              color: 'var(--blue)',
              desc: 'Raw data arrives in different formats from each platform. Our processing pipeline normalizes everything into a unified schema — songs are matched across platforms using ISRC codes, titles, and artist names. Chart positions are tracked over time to calculate position changes, peak positions, and weeks on chart. Cross-platform scores are computed by weighting performance across all sources.',
              details: [
                'Songs matched by ISRC, title similarity, and artist name',
                'Position changes calculated against previous day data',
                'Cross-platform power scores weighted by platform reach',
                'Trending velocity computed from 7-day sparkline data',
              ],
            },
            {
              step: '3',
              title: 'Storage & Caching',
              color: 'var(--purple)',
              desc: 'Processed data is stored in Cloudflare D1 (SQLite at the edge) for fast queries and Cloudflare KV for cached page responses. When a scraper writes new data, it automatically invalidates the relevant KV cache keys, ensuring the website always shows the freshest data without sacrificing performance. Every query is optimized for sub-10ms response times at the edge.',
              details: [
                'D1 database for persistent chart, trending, and artist data',
                'KV cache for pre-rendered page fragments',
                'Automatic cache invalidation on data updates',
                'Edge-deployed for global sub-10ms latency',
              ],
            },
            {
              step: '4',
              title: 'Presentation & Discovery',
              color: 'var(--gold)',
              desc: 'The website is built with Next.js as a static export deployed on Cloudflare Pages. Charts, trending sections, and artist pages are pre-rendered for instant loading. Interactive elements like platform filters and region selectors are handled client-side for a smooth, app-like experience. The dark theme and gradient accents are designed for comfortable long browsing sessions.',
              details: [
                'Static export for instant page loads',
                'Client-side interactivity for filters and selectors',
                'Responsive design from mobile to ultrawide',
                'Accessibility-first with semantic HTML',
              ],
            },
          ].map(item => (
            <div key={item.step} className="mp-card p-8">
              <div className="flex items-start gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px] font-black flex-shrink-0"
                  style={{ background: `${item.color}18`, color: item.color, fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {item.step}
                </div>
                <div className="flex-1">
                  <h2 className="text-[20px] font-bold tracking-[-0.02em] mb-3">{item.title}</h2>
                  <p className="text-[14px] text-[var(--text2)] leading-relaxed font-medium mb-4">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text3)] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: item.color }} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
