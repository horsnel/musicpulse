'use client'

import type { TrendingItem } from '@/types'
import { formatCount, cn } from '@/lib/utils'
import { MiniPlatformIcon } from '@/components/ui/PlatformIcons'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface Props {
  entries: TrendingItem[]
}

export function BillboardPageClient({ entries }: Props) {
  return (
    <div className="relative z-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9"
          style={{ background: 'linear-gradient(180deg,rgba(230,0,38,0.06) 0%,transparent 100%)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
              style={{ background: 'rgba(230,0,38,0.12)', border: '1px solid rgba(230,0,38,0.25)', color: '#e60026' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#e60026' }} />
              Updating every hour
            </span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]" style={{ color: '#e60026' }}>
            Billboard Hot 100
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            United States · The definitive US music rankings
          </p>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="mp-card">
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(230,0,38,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke="#e60026" strokeWidth="1.5" fill="none" />
                  <path d="M10 18V13M14 18V10M18 18V15" stroke="#e60026" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[var(--text)] mb-2">Data Coming Soon</h3>
              <p className="text-[13px] sm:text-[14px] text-[var(--text3)] max-w-[320px] leading-relaxed">
                We&apos;re currently collecting Billboard chart data. Check back soon — charts refresh every 6 hours.
              </p>
              <a href="/charts" className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--green)] no-underline hover:underline">
                ← Back to Charts
              </a>
            </div>
          </div>
        )}

        {/* Chart */}
        {entries.length > 0 && <div className="mp-card">
          {/* Desktop column headers */}
          <div className="hidden md:grid items-center px-[22px] h-9 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '52px 48px 1fr 100px 90px' }}>
            {['#', '', 'Song', 'Metric', 'Badge'].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">{h}</div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden md:block">
            {entries.map(entry => {
              const songSlug = slugify(entry.songTitle + '-' + entry.artistName)
              return (
                <Link
                  key={entry.id}
                  href={`/songs/${songSlug}`}
                  className="grid items-center px-[22px] h-[66px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                  style={{ gridTemplateColumns: '52px 48px 1fr 100px 90px' }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={cn('text-[16px] font-black tracking-[-0.03em] leading-none',
                      entry.rank === 1 ? 'rank-gold' : entry.rank === 2 ? 'rank-silver' : entry.rank === 3 ? 'rank-bronze' : entry.isNew ? 'text-[var(--blue)]' : 'text-[var(--text3)]')}>
                      {entry.rank}
                    </span>
                    <span className={cn('text-[10px] font-bold flex items-center gap-0.5',
                      entry.isNew ? 'text-[var(--blue)]' : entry.rankChange > 0 ? 'text-[var(--green)]' : entry.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                      {entry.isNew ? 'NEW' : entry.rankChange > 0 ? `↑${entry.rankChange}` : entry.rankChange < 0 ? `↓${Math.abs(entry.rankChange)}` : '—'}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] mx-1 overflow-hidden"
                    style={{ background: entry.albumCoverUrl ? 'var(--bg3)' : (entry.artGradient ?? 'var(--bg3)') }}>
                    {entry.albumCoverUrl ? (
                      <img src={entry.albumCoverUrl} alt={entry.songTitle} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      entry.artEmoji || '🎵'
                    )}
                  </div>
                  <div className="pl-3.5 min-w-0">
                    <div className="text-[14px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">{entry.songTitle}</div>
                    <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">{entry.artistName}</div>
                  </div>
                  <div className="pl-2 text-[13px] font-semibold text-[var(--text2)]">
                    {entry.metric ? formatCount(entry.metric) : '—'}
                    <span className="text-[10px] text-[var(--text3)] ml-1">{entry.metricUnit}</span>
                  </div>
                  <div className="pl-2">
                    {entry.badge && (
                      <span className="text-[9px] font-black tracking-[0.08em] uppercase px-2 py-0.5 rounded"
                        style={entry.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                          : entry.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                          : entry.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                          : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                        {entry.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Mobile rows */}
          <div className="md:hidden">
            {entries.map(entry => {
              const songSlug = slugify(entry.songTitle + '-' + entry.artistName)
              return (
                <Link
                  key={entry.id}
                  href={`/songs/${songSlug}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                >
                  <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                    <span className={cn('text-[15px] font-black tracking-[-0.03em] leading-none',
                      entry.rank === 1 ? 'rank-gold' : entry.rank === 2 ? 'rank-silver' : entry.rank === 3 ? 'rank-bronze' : entry.isNew ? 'text-[var(--blue)]' : 'text-[var(--text3)]')}>
                      {entry.rank}
                    </span>
                    <span className={cn('text-[9px] font-bold flex items-center gap-0.5',
                      entry.isNew ? 'text-[var(--blue)]' : entry.rankChange > 0 ? 'text-[var(--green)]' : entry.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                      {entry.isNew ? 'NEW' : entry.rankChange > 0 ? `↑${entry.rankChange}` : entry.rankChange < 0 ? `↓${Math.abs(entry.rankChange)}` : '—'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0 overflow-hidden"
                    style={{ background: entry.albumCoverUrl ? 'var(--bg3)' : (entry.artGradient ?? 'var(--bg3)') }}>
                    {entry.albumCoverUrl ? (
                      <img src={entry.albumCoverUrl} alt={entry.songTitle} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      entry.artEmoji || '🎵'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">{entry.songTitle}</div>
                    <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">{entry.artistName}</div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                    <span className="text-[12px] font-semibold text-[var(--text2)]">
                      {entry.metric ? formatCount(entry.metric) : '—'}
                    </span>
                    {entry.badge && (
                      <span className="text-[8px] font-bold tracking-[0.08em] uppercase"
                        style={entry.badge === 'hot' ? { color: '#ff6b1a' } : entry.badge === 'new' ? { color: '#3b82f6' } : { color: '#1DB954' }}>
                        {entry.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>}
      </div>
    </div>
  )
}
