'use client'

import { cn, formatCount } from '@/lib/utils'
import type { ChartEntry, ChartRegion } from '@/types'

interface CountryData {
  region: ChartRegion
  flag: string
  name: string
  topSong: string
  topArtist: string
}

interface Props {
  countries: CountryData[]
  featured: ChartEntry[]
}

export function CountriesPageClient({ countries, featured }: Props) {
  return (
    <div className="relative z-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9"
          style={{ background: 'linear-gradient(180deg,rgba(29,185,84,0.06) 0%,transparent 100%)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
              style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
              200+ Regions
            </span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
            Country Charts
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            Browse top songs and artists in 200+ countries worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 sm:gap-6 items-start">
          {/* Country list */}
          <div className="mp-card">
            <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-4 border-b border-[var(--border)]">
              <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em]">All Regions</div>
              <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium">{countries.length} countries</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {countries.map(c => (
                <a
                  key={c.region}
                  href={`/charts?region=${c.region}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-[22px] py-3.5 sm:py-4 cursor-pointer transition-colors hover:bg-[var(--bg3)] no-underline"
                >
                  <span className="text-[22px] sm:text-[26px] w-[34px] sm:w-[40px] text-center flex-shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] sm:text-[15px] font-bold tracking-[-0.01em] text-[var(--text)]">{c.name}</div>
                    <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      #1 {c.topSong} — {c.topArtist}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--text3)] flex-shrink-0">
                    <polyline points="5,3 9,7 5,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Sidebar: Global top 10 */}
          <div className="mp-card">
            <div className="flex items-center justify-between px-4 sm:px-[18px] py-3.5 sm:py-[15px] border-b border-[var(--border)]">
              <div className="text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Global Top 10</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {featured.map(entry => (
                <div key={entry.id} className="flex items-center gap-2.5 px-4 sm:px-[18px] py-2.5 sm:py-3 cursor-pointer transition-colors hover:bg-[var(--bg3)]">
                  <span className={cn('text-[14px] font-black tracking-[-0.03em] w-5 text-center flex-shrink-0',
                    entry.position === 1 ? 'rank-gold' : entry.position === 2 ? 'rank-silver' : entry.position === 3 ? 'rank-bronze' : 'text-[var(--text3)]')}>
                    {entry.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] sm:text-[13px] font-semibold text-[var(--text)] truncate">{entry.song.title}</div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--text3)] truncate">{entry.song.artistName}</div>
                  </div>
                  <div className="text-[11px] sm:text-[12px] font-semibold text-[var(--text2)] flex-shrink-0">
                    {entry.streams ? formatCount(entry.streams) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
