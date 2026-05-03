import Link from 'next/link'
import { PlatformIcon } from '@/components/ui/PlatformIcons'

const FOOTER_COLS = [
  {
    heading: 'Discover',
    links: [
      { label: 'Global Charts',       href: '/charts' },
      { label: 'New Releases',        href: '/new-releases' },
      { label: 'Trending on TikTok',  href: '/trending/tiktok' },
      { label: 'Top Artists',         href: '/artists' },
      { label: 'Browse Genres',       href: '/genres' },
      { label: 'Weekly Digest',       href: '/newsletter' },
    ],
  },
  {
    heading: 'Platforms',
    links: [
      { label: 'Spotify Charts',      href: '/charts/spotify' },
      { label: 'Apple Music Top 100', href: '/charts/apple' },
      { label: 'YouTube Music',       href: '/charts/youtube' },
      { label: 'Billboard Hot 100',   href: '/charts/billboard' },
      { label: 'Country Charts',      href: '/charts/countries' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About MusicPulse', href: '/about' },
      { label: 'How It Works',     href: '/how-it-works' },
      { label: 'Blog',             href: '/blog' },
      { label: 'Advertise',        href: '/advertise' },
      { label: 'API Access',       href: '/api-docs' },
      { label: 'Contact',          href: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--bg2)] border-t border-[var(--border)] pt-10 sm:pt-[52px] pb-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7">

        {/* Newsletter strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 bg-[var(--bg3)] border border-[var(--border)] rounded-2xl px-5 sm:px-8 py-5 sm:py-7 mb-8 sm:mb-12">
          <div className="flex-1">
            <div className="text-[15px] sm:text-[17px] font-extrabold tracking-[-0.03em] mb-1">
              Weekly Charts Digest
            </div>
            <div className="text-[12px] sm:text-[13px] text-[var(--text3)] font-medium">
              Top 10 songs, biggest movers &amp; new releases every Friday.
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] text-[13px] sm:text-[13.5px] font-medium px-3.5 sm:px-4 py-[11px] rounded-[10px] outline-none flex-1 sm:w-[220px] focus:border-[var(--green)] transition-colors placeholder:text-[var(--text3)]"
            />
            <button className="flex items-center gap-2 bg-[var(--green)] text-black text-[13px] sm:text-[14px] font-bold px-4 sm:px-[22px] py-[11px] rounded-xl hover:bg-[#1ed760] transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-[260px_1fr_1fr_1fr] gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand - spans full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3.5 no-underline">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#1DB954] to-[#0d8c3d] flex items-center justify-center flex-shrink-0">
                <WaveformIcon />
              </div>
              <span className="text-[17px] font-extrabold text-[var(--text)] tracking-[-0.03em]">
                Music<span className="text-[var(--green)]">Pulse</span>
              </span>
            </Link>
            <p className="text-[12px] sm:text-[13px] text-[var(--text3)] leading-relaxed mb-5 max-w-[320px]">
              The world&apos;s music data in one place. Charts, trends, releases, and artists — updated around the clock.
            </p>
            <div className="flex gap-2">
              {[
                { platform: 'twitter' as const, href: 'https://x.com/musicpulse' },
                { platform: 'instagram' as const, href: 'https://instagram.com/musicpulse' },
                { platform: 'tiktok' as const, href: 'https://tiktok.com/@musicpulse' },
                { platform: 'rss' as const, href: '/rss' },
              ].map(s => (
                <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="w-[34px] h-[34px] rounded-[9px] bg-[var(--bg3)] border border-[var(--border)] flex items-center justify-center cursor-pointer transition-all hover:border-[var(--border2)] hover:scale-110">
                  <PlatformIcon platform={s.platform} size={16} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <h4 className="text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text3)] mb-3 sm:mb-3.5">
                {col.heading}
              </h4>
              <ul className="list-none flex flex-col gap-2 sm:gap-[9px]">
                {col.links.map(link => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[12px] sm:text-[13.5px] text-[var(--text2)] no-underline font-medium transition-colors hover:text-[var(--text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-[22px] border-t border-[var(--border)]">
          <div className="text-[11px] sm:text-[12.5px] text-[var(--text3)] font-medium text-center sm:text-left">
            &copy; {new Date().getFullYear()}{' '}
            <span className="text-[var(--green)]">MusicPulse</span>.{' '}
            Data sourced from public APIs. Not affiliated with Spotify or Apple.
          </div>
          <div className="flex gap-[18px] flex-wrap justify-center">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'About', href: '/about' },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] sm:text-[12.5px] text-[var(--text3)] no-underline font-medium transition-colors hover:text-[var(--text2)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// Icons
function WaveformIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="7" width="2.5" height="6" rx="1.25" fill="#000" />
      <rect x="6" y="4" width="2.5" height="12" rx="1.25" fill="#000" />
      <rect x="10" y="2" width="2.5" height="16" rx="1.25" fill="#000" />
      <rect x="14" y="5" width="2.5" height="10" rx="1.25" fill="#000" />
      <rect x="17.5" y="8" width="2.5" height="4" rx="1.25" fill="#000" />
    </svg>
  )
}
