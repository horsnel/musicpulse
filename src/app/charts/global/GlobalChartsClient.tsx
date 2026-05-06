'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AggregatedChartEntry } from '@/types'
import { formatCount, cn } from '@/lib/utils'
import { MiniPlatformIcon } from '@/components/ui/PlatformIcons'

interface Props {
  entries: AggregatedChartEntry[]
}

export function GlobalChartsClient({ entries }: Props) {
  const [search, setSearch] = useState('')
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
        style={{ background: 'linear-gradient(180deg,rgba(29,185,84,0.08) 0%,transparent 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
                  style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
                  Cross-Platform
                </span>
              </div>
              <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
                Global Charts — Aggregated
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2 max-w-[520px]">
                The most accurate global music rankings — accumulated from all platforms
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
                  className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[10px] pl-9 pr-4 py-[9px] text-[13px] font-medium text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--green)] transition-colors w-[220px] sm:w-[260px]"
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--green-dim)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <polyline points="1,12 4.5,7.5 8,10 11.5,5 15,2" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em]">Aggregated Rankings</div>
                <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium">
                  {filtered.length} songs · {entries.length > 0 ? 'All platforms combined' : 'Loading...'}
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
            style={{ gridTemplateColumns: '52px 48px 1fr 120px 80px 100px 80px' }}>
            {['#', '', 'Song', 'Platforms', 'Count', 'Streams', 'Score'].map((h, i) => (
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
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3">
                  <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <line x1="21" y1="21" x2="28" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-[14px] font-medium">{search ? 'No matching songs found' : 'Loading chart data...'}</p>
                <p className="text-[12px] mt-1">Data refreshes from live sources.</p>
              </div>
            ) : (
              visible.map((entry, i) => (
                <Link
                  key={entry.songId}
                  href={`/songs/${entry.songId}`}
                  className="grid items-center px-[22px] h-[62px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                  style={{ gridTemplateColumns: '52px 48px 1fr 120px 80px 100px 80px' }}
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

                  {/* Song + Artist */}
                  <div className="pl-3.5 min-w-0">
                    <div className="text-[14px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">
                      {entry.songTitle}
                    </div>
                    <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      {entry.artistName}
                    </div>
                  </div>

                  {/* Platform icons */}
                  <div className="flex items-center justify-end gap-1">
                    {entry.platforms.slice(0, 5).map(p => (
                      <MiniPlatformIcon key={p} platform={p as any} size={14} />
                    ))}
                    {entry.platforms.length > 5 && (
                      <span className="text-[10px] font-bold text-[var(--text3)]">+{entry.platforms.length - 5}</span>
                    )}
                  </div>

                  {/* Platform count */}
                  <div className="text-right text-[13px] font-semibold text-[var(--text2)]">
                    {entry.platformCount}
                  </div>

                  {/* Total streams */}
                  <div className="text-right text-[13px] font-semibold text-[var(--text2)]">
                    {formatCount(entry.totalStreams)}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className={cn(
                      'text-[14px] font-black tracking-[-0.02em]',
                      entry.aggregatedScore >= 90 ? 'text-[var(--gold)]' :
                      entry.aggregatedScore >= 70 ? 'text-[var(--green)]' :
                      entry.aggregatedScore >= 50 ? 'text-[var(--text)]' : 'text-[var(--text2)]',
                    )}>
                      {entry.aggregatedScore.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Mobile rows */}
          <div className="lg:hidden max-h-[600px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
                <p className="text-[14px] font-medium">{search ? 'No matching songs found' : 'Loading chart data...'}</p>
              </div>
            ) : (
              visible.map((entry, i) => (
                <Link
                  key={entry.songId}
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
                      {entry.platforms.slice(0, 4).map(p => (
                        <MiniPlatformIcon key={p} platform={p as any} size={10} />
                      ))}
                      {entry.platforms.length > 4 && (
                        <span className="text-[9px] font-bold text-[var(--text3)]">+{entry.platforms.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Score + Streams */}
                  <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                    <span className={cn(
                      'text-[14px] font-black',
                      entry.aggregatedScore >= 90 ? 'text-[var(--gold)]' :
                      entry.aggregatedScore >= 70 ? 'text-[var(--green)]' : 'text-[var(--text)]',
                    )}>
                      {entry.aggregatedScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text3)]">
                      {formatCount(entry.totalStreams)}
                    </span>
                  </div>
                </Link>
              ))
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

        {/* Stats sidebar-like strip */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)] rounded-[16px] overflow-hidden mt-6">
            {[
              { label: 'Songs Ranked', value: String(entries.length), color: 'var(--green)' },
              { label: 'Platforms', value: String(new Set(entries.flatMap(e => e.platforms)).size), color: 'var(--blue)' },
              { label: 'Total Streams', value: formatCount(entries.reduce((s, e) => s + e.totalStreams, 0)), color: 'var(--gold)' },
              { label: 'Avg Score', value: (entries.reduce((s, e) => s + e.aggregatedScore, 0) / entries.length).toFixed(1), color: 'var(--purple)' },
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
