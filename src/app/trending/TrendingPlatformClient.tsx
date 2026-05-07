'use client'

import Link from 'next/link'
import type { TrendingItem } from '@/types'
import { formatCount, cn, slugify } from '@/lib/utils'

interface Props {
  platform: string
  label: string
  sub: string
  color: string
  items: TrendingItem[]
}

export function TrendingPlatformPageClient({ platform, label, sub, color, items }: Props) {
  return (
    <div className="relative z-10">
      <div className="live-gradient-bar" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-[0.1em] uppercase"
              style={{ background: `${color}1a`, border: `1px solid ${color}40`, color }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: color }} />
              LIVE
            </span>
            <span className="text-[10px] sm:text-[12px] font-medium text-[var(--text3)]">Updated every 2h</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]" style={{ color }}>
            {label}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            {sub} — updated in real time.
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="mp-card">
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" fill="none" />
                  <path d="M10 18V13M14 18V10M18 18V15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[var(--text)] mb-2">Data Coming Soon</h3>
              <p className="text-[13px] sm:text-[14px] text-[var(--text3)] max-w-[320px] leading-relaxed">
                We&apos;re currently collecting data for {label}. Check back in a few hours — our scrapers refresh every 2 hours.
              </p>
              <a href="/trending" className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--green)] no-underline hover:underline">
                ← Back to Trending
              </a>
            </div>
          </div>
        )}

        {/* List */}
        {items.length > 0 && <div className="mp-card">
          <div className="hidden sm:grid items-center px-[22px] h-10 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '50px 48px 1fr 120px 90px' }}>
            {['#', '', 'Song', 'Change', 'Metric'].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">{h}</div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden sm:block">
            {items.map(item => (
              <Link key={item.id} href={`/songs/${slugify(item.songTitle + '-' + item.artistName)}`} className="grid items-center px-[22px] h-[62px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline text-inherit"
                style={{ gridTemplateColumns: '50px 48px 1fr 120px 90px' }}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn('text-[16px] font-black tracking-[-0.03em] leading-none',
                    item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : item.isNew ? 'text-[#3b82f6]' : 'text-[var(--text3)]')}>
                    {item.rank}
                  </span>
                  <span className={cn('text-[10px] font-bold flex items-center gap-0.5',
                    item.isNew ? 'text-[#3b82f6]' : item.rankChange > 0 ? 'text-[var(--green)]' : item.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                    {item.isNew ? 'NEW' : item.rankChange > 0 ? `↑${item.rankChange}` : item.rankChange < 0 ? `↓${Math.abs(item.rankChange)}` : '—'}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] overflow-hidden"
                  style={{ background: item.albumCoverUrl ? 'var(--bg3)' : (item.artGradient ?? 'var(--bg3)') }}>
                  {item.albumCoverUrl ? (
                    <img src={item.albumCoverUrl} alt={item.songTitle} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    item.artEmoji ?? '🎵'
                  )}
                </div>
                <div className="pl-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold tracking-[-0.02em] truncate">{item.songTitle}</span>
                    {item.badge && (
                      <span className="flex-shrink-0 text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                        style={item.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                          : item.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                          : item.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                          : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                        {item.badge.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">{item.artistName}</div>
                </div>
                <div className="pl-2 text-[13px] font-medium text-[var(--text3)] truncate">{item.isNew ? 'New Entry' : item.rankChange > 0 ? `Up ${item.rankChange}` : item.rankChange < 0 ? `Down ${Math.abs(item.rankChange)}` : 'Steady'}</div>
                <div className="pl-2 text-right">
                  <div className="text-[14px] font-extrabold tracking-[-0.02em]" style={{ color }}>{formatCount(item.metric)}</div>
                  <div className="text-[10px] font-semibold text-[var(--text3)] mt-0.5">{item.metricUnit}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile rows */}
          <div className="sm:hidden">
            {items.map(item => (
              <Link key={item.id} href={`/songs/${slugify(item.songTitle + '-' + item.artistName)}`} className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline text-inherit">
                <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                  <span className={cn('text-[15px] font-black tracking-[-0.03em] leading-none',
                    item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : item.isNew ? 'text-[#3b82f6]' : 'text-[var(--text3)]')}>
                    {item.rank}
                  </span>
                  <span className={cn('text-[9px] font-bold flex items-center gap-0.5',
                    item.isNew ? 'text-[#3b82f6]' : item.rankChange > 0 ? 'text-[var(--green)]' : item.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                    {item.isNew ? 'NEW' : item.rankChange > 0 ? `↑${item.rankChange}` : item.rankChange < 0 ? `↓${Math.abs(item.rankChange)}` : '—'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0 overflow-hidden"
                  style={{ background: item.albumCoverUrl ? 'var(--bg3)' : (item.artGradient ?? 'var(--bg3)') }}>
                  {item.albumCoverUrl ? (
                    <img src={item.albumCoverUrl} alt={item.songTitle} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    item.artEmoji ?? '🎵'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold tracking-[-0.02em] truncate">{item.songTitle}</span>
                    {item.badge && (
                      <span className="flex-shrink-0 text-[7px] font-black tracking-[0.1em] uppercase px-1 py-0.5 rounded"
                        style={item.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                          : item.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                          : item.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                          : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                        {item.badge.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">{item.artistName}</div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <div className="text-[12px] font-extrabold tracking-[-0.02em]" style={{ color }}>{formatCount(item.metric)}</div>
                  <div className="text-[10px] font-semibold text-[var(--text3)] mt-0.5">{item.metricUnit}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>}
      </div>
    </div>
  )
}
