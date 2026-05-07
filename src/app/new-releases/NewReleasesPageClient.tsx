'use client'

import { useState } from 'react'
import type { Album } from '@/types'
import { ReleasesGrid } from '@/components/song/ReleasesGrid'
import { cn } from '@/lib/utils'

interface Props {
  releases: Album[]
}

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'album', label: 'Albums' },
  { key: 'ep', label: 'EPs' },
  { key: 'single', label: 'Singles' },
]

export function NewReleasesPageClient({ releases }: Props) {
  const [activeType, setActiveType] = useState('all')

  const filtered = activeType === 'all'
    ? releases
    : releases.filter(r => r.type === activeType)

  // Group by release date (today, this week, earlier)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(today.getTime() - 7 * 86400000)
  const thisMonth = new Date(today.getTime() - 30 * 86400000)

  const todayReleases = filtered.filter(r => new Date(r.releaseDate) >= today)
  const thisWeekReleases = filtered.filter(r => {
    const d = new Date(r.releaseDate)
    return d >= thisWeek && d < today
  })
  const thisMonthReleases = filtered.filter(r => {
    const d = new Date(r.releaseDate)
    return d >= thisMonth && d < thisWeek
  })
  const olderReleases = filtered.filter(r => new Date(r.releaseDate) < thisMonth)

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(67,97,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--blue-dim)', border: '1px solid rgba(67,97,255,0.25)', color: 'var(--blue)' }}>
            Fresh Drops
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            New Releases
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            The latest albums, EPs, and singles from across the globe. Updated daily so you can stay on top of every fresh drop.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-8" />

        {/* Type filter tabs */}
        <div className="flex gap-0.5 bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-[3px] w-fit mb-6 sm:mb-8">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveType(f.key)}
              className={cn(
                'px-4 py-2 rounded-[9px] text-[13px] font-semibold tracking-[-0.01em] transition-all border-none cursor-pointer',
                activeType === f.key
                  ? 'bg-[var(--bg3)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text3)] hover:text-[var(--text2)] bg-transparent',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grouped releases */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--text3)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] font-medium">Loading new releases...</p>
            <p className="text-[12px] mt-1">Release data refreshes from live sources.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {todayReleases.length > 0 && (
              <section>
                <h2 className="text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                  Released Today
                  <span className="text-[12px] font-medium text-[var(--text3)] ml-1">{todayReleases.length} new</span>
                </h2>
                <ReleasesGrid albums={todayReleases} />
              </section>
            )}

            {thisWeekReleases.length > 0 && (
              <section>
                <h2 className="text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--blue)]" />
                  This Week
                  <span className="text-[12px] font-medium text-[var(--text3)] ml-1">{thisWeekReleases.length} releases</span>
                </h2>
                <ReleasesGrid albums={thisWeekReleases} />
              </section>
            )}

            {thisMonthReleases.length > 0 && (
              <section>
                <h2 className="text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--purple)]" />
                  This Month
                  <span className="text-[12px] font-medium text-[var(--text3)] ml-1">{thisMonthReleases.length} releases</span>
                </h2>
                <ReleasesGrid albums={thisMonthReleases} />
              </section>
            )}

            {olderReleases.length > 0 && (
              <section>
                <h2 className="text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--text3)]" />
                  Earlier
                  <span className="text-[12px] font-medium text-[var(--text3)] ml-1">{olderReleases.length} releases</span>
                </h2>
                <ReleasesGrid albums={olderReleases} />
              </section>
            )}

            {/* Fallback: if no date grouping works, just show all */}
            {todayReleases.length === 0 && thisWeekReleases.length === 0 && thisMonthReleases.length === 0 && olderReleases.length === 0 && filtered.length > 0 && (
              <ReleasesGrid albums={filtered} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
