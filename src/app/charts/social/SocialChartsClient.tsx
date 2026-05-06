'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SocialChartEntry } from '@/types'
import { formatCount, cn } from '@/lib/utils'
import { MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

interface Props {
  entries: SocialChartEntry[]
}

export function SocialChartsClient({ entries }: Props) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(50)

  const filtered = entries.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.songTitle.toLowerCase().includes(q) ||
      e.artistName.toLowerCase().includes(q)
    )
  })

  const visible = filtered.slice(0, showCount)

  return (
    <div className="relative z-10">
      {/* Page header */}
      <div
        className="border-b border-[var(--border)] pt-8 sm:pt-10 pb-0"
        style={{ background: 'linear-gradient(180deg,rgba(255,45,107,0.08) 0%,transparent 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
                  style={{ background: 'var(--pink-dim)', border: '1px solid rgba(255,45,107,0.25)', color: 'var(--pink)' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--pink)' }} />
                  Social Engagement
                </span>
              </div>
              <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
                Social Media Charts
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2 max-w-[520px]">
                Accumulated social media engagement across TikTok, X, YouTube, and more
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
                  <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search songs or artists..."
                  className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[10px] pl-9 pr-4 py-[9px] text-[13px] font-medium text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--pink)] transition-colors w-[220px] sm:w-[260px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart table */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 py-5 sm:py-7">
        <div className="mp-card">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-4 border-b border-[var(--border)] gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--pink-dim)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 10c2-4 4-5 6-3 2 2 3 1 5-4" stroke="var(--pink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M11 5l3 0 0 3" stroke="var(--pink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em]">Social Rankings</div>
                <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium">
                  {filtered.length} songs · {entries.length > 0 ? 'Social platforms combined' : 'Loading...'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[3px]">
                {[50, 100, 200].map(n => (
                  <button
                    key={n}
                    onClick={() => setShowCount(n)}
                    className={cn(
                      'px-2 sm:px-3 py-[5px] rounded-md text-[10px] sm:text-[11.5px] font-semibold cursor-pointer border-none transition-all',
                      showCount === n
                        ? 'bg-[var(--bg4)] text-[var(--text)] shadow-sm'
                        : 'text-[var(--text3)] hover:text-[var(--text2)] bg-transparent',
                    )}
                  >
                    Top {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop column headers */}
          <div className="hidden lg:grid items-center px-[22px] h-9 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '52px 48px 1fr 120px 100px 80px' }}>
            {['#', '', 'Song', 'Platforms', 'Engagement', 'Score'].map((h, i) => (
              <div key={i} className={cn(
                'text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)]',
                i > 1 ? 'text-right' : i === 0 ? 'text-center' : '',
              )}>
                {h}
              </div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden lg:block max-h-[800px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
                <p className="text-[14px] font-medium">{search ? 'No matching songs found' : 'Loading social chart data...'}</p>
                <p className="text-[12px] mt-1">Data refreshes from live sources.</p>
              </div>
            ) : (
              visible.map((entry, i) => {
                const isExpanded = expandedId === entry.songId
                return (
                  <div key={entry.songId}>
                    <Link
                      href={`/songs/${entry.songId}`}
                      className="grid items-center px-[22px] h-[62px] border-b border-[rgba(28,30,46,0.6)] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                      style={{ gridTemplateColumns: '52px 48px 1fr 120px 100px 80px' }}
                      onClick={e => {
                        // Toggle breakdown on ctrl+click
                        if (e.ctrlKey || e.metaKey) {
                          e.preventDefault()
                          setExpandedId(isExpanded ? null : entry.songId)
                        }
                      }}
                    >
                      {/* Rank */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={cn(
                          'text-[16px] font-black tracking-[-0.03em] leading-none',
                          i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : 'text-[var(--text3)]',
                        )}>
                          {i + 1}
                        </span>
                      </div>

                      {/* Art */}
                      <div
                        className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] overflow-hidden"
                        style={{ background: entry.albumCoverUrl ? 'var(--bg3)' : (entry.artGradient ?? 'var(--bg3)') }}
                      >
                        {entry.albumCoverUrl ? (
                          <img src={entry.albumCoverUrl} alt={entry.songTitle} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          entry.artEmoji ?? '🎵'
                        )}
                      </div>

                      {/* Song + Artist + breakdown toggle */}
                      <div className="pl-3.5 min-w-0">
                        <div className="text-[14px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">
                          {entry.songTitle}
                        </div>
                        <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">
                          {entry.artistName}
                          <button
                            onClick={e => { e.preventDefault(); setExpandedId(isExpanded ? null : entry.songId) }}
                            className="ml-2 text-[10px] font-bold text-[var(--pink)] hover:underline bg-transparent border-none cursor-pointer p-0"
                          >
                            {isExpanded ? 'Hide breakdown ↑' : 'Show breakdown ↓'}
                          </button>
                        </div>
                      </div>

                      {/* Social platform icons */}
                      <div className="flex items-center justify-end gap-1">
                        {entry.socialPlatforms.slice(0, 5).map(p => (
                          <MiniPlatformIcon key={p} platform={p as any} size={14} />
                        ))}
                        {entry.socialPlatforms.length > 5 && (
                          <span className="text-[10px] font-bold text-[var(--text3)]">+{entry.socialPlatforms.length - 5}</span>
                        )}
                      </div>

                      {/* Engagement */}
                      <div className="text-right text-[13px] font-semibold text-[var(--text2)]">
                        {formatCount(entry.totalEngagement)}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <span className={cn(
                          'text-[14px] font-black tracking-[-0.02em]',
                          entry.socialScore >= 90 ? 'text-[var(--gold)]' :
                          entry.socialScore >= 70 ? 'text-[var(--pink)]' :
                          entry.socialScore >= 50 ? 'text-[var(--text)]' : 'text-[var(--text2)]',
                        )}>
                          {entry.socialScore.toFixed(1)}
                        </span>
                      </div>
                    </Link>

                    {/* Breakdown panel */}
                    {isExpanded && entry.breakdown.length > 0 && (
                      <div className="px-[22px] py-3 border-b border-[rgba(28,30,46,0.6)] bg-[rgba(255,45,107,0.03)]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text3)]">Platform Breakdown</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entry.breakdown.map(b => {
                            const colors = PLATFORM_COLORS[b.platform]
                            return (
                              <div
                                key={b.platform}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg2)]"
                              >
                                <MiniPlatformIcon platform={b.platform as any} size={12} />
                                <span className="text-[11px] font-bold text-[var(--text)]">#{b.rank}</span>
                                <span className="text-[10px] text-[var(--text3)]">{formatCount(b.metric)} {b.metricUnit}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Mobile rows */}
          <div className="lg:hidden max-h-[600px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
                <p className="text-[14px] font-medium">{search ? 'No matching songs found' : 'Loading social chart data...'}</p>
              </div>
            ) : (
              visible.map((entry, i) => {
                const isExpanded = expandedId === entry.songId
                return (
                  <div key={entry.songId}>
                    <Link
                      href={`/songs/${entry.songId}`}
                      className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                    >
                      {/* Rank */}
                      <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                        <span className={cn(
                          'text-[15px] font-black tracking-[-0.03em] leading-none',
                          i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : 'text-[var(--text3)]',
                        )}>
                          {i + 1}
                        </span>
                      </div>

                      {/* Art */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0 overflow-hidden"
                        style={{ background: entry.albumCoverUrl ? 'var(--bg3)' : (entry.artGradient ?? 'var(--bg3)') }}
                      >
                        {entry.albumCoverUrl ? (
                          <img src={entry.albumCoverUrl} alt={entry.songTitle} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          entry.artEmoji ?? '🎵'
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">
                          {entry.songTitle}
                        </div>
                        <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">
                          {entry.artistName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {entry.socialPlatforms.slice(0, 4).map(p => (
                            <MiniPlatformIcon key={p} platform={p as any} size={10} />
                          ))}
                          <button
                            onClick={e => { e.preventDefault(); setExpandedId(isExpanded ? null : entry.songId) }}
                            className="text-[9px] font-bold text-[var(--pink)] bg-transparent border-none cursor-pointer p-0 ml-1"
                          >
                            {isExpanded ? '↑' : '↓'}
                          </button>
                        </div>
                      </div>

                      {/* Score + Engagement */}
                      <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                        <span className={cn(
                          'text-[14px] font-black',
                          entry.socialScore >= 90 ? 'text-[var(--gold)]' :
                          entry.socialScore >= 70 ? 'text-[var(--pink)]' : 'text-[var(--text)]',
                        )}>
                          {entry.socialScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--text3)]">
                          {formatCount(entry.totalEngagement)}
                        </span>
                      </div>
                    </Link>

                    {/* Mobile breakdown */}
                    {isExpanded && entry.breakdown.length > 0 && (
                      <div className="px-4 pb-3 border-b border-[rgba(28,30,46,0.6)] bg-[rgba(255,45,107,0.03)]">
                        <div className="flex flex-wrap gap-1.5">
                          {entry.breakdown.map(b => (
                            <div
                              key={b.platform}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg2)]"
                            >
                              <MiniPlatformIcon platform={b.platform as any} size={10} />
                              <span className="text-[10px] font-bold text-[var(--text)]">#{b.rank}</span>
                              <span className="text-[9px] text-[var(--text3)]">{formatCount(b.metric)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Load more */}
          {showCount < filtered.length && (
            <button
              onClick={() => setShowCount(prev => Math.min(prev + 50, filtered.length))}
              className="flex items-center justify-center gap-2 py-4 sm:py-5 text-[12px] sm:text-[13px] font-semibold text-[var(--text3)] cursor-pointer hover:text-[var(--text2)] transition-colors border-t border-[var(--border)] w-full bg-transparent border-x-0 border-b-0"
            >
              Show more ({filtered.length - showCount} remaining)
            </button>
          )}
        </div>

        {/* Stats strip */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)] rounded-[16px] overflow-hidden mt-6">
            {[
              { label: 'Songs Ranked', value: String(entries.length), color: 'var(--pink)' },
              { label: 'Social Platforms', value: String(new Set(entries.flatMap(e => e.socialPlatforms)).size), color: 'var(--blue)' },
              { label: 'Total Engagement', value: formatCount(entries.reduce((s, e) => s + e.totalEngagement, 0)), color: 'var(--gold)' },
              { label: 'Avg Score', value: (entries.reduce((s, e) => s + e.socialScore, 0) / entries.length).toFixed(1), color: 'var(--purple)' },
            ].map(s => (
              <div key={s.label} className="bg-[var(--bg2)] px-4 py-4">
                <div className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5">{s.label}</div>
                <div className="text-[18px] font-black tracking-[-0.03em]" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
