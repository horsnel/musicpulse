'use client'

import type { ChartEntry } from '@/types'
import { formatCount, cn } from '@/lib/utils'

interface Props {
  platform: string
  label: string
  color: string
  regionName: string
  entries: ChartEntry[]
}

export function ChartPlatformPageClient({ platform, label, color, regionName, entries }: Props) {
  return (
    <div className="relative z-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9"
          style={{ background: 'linear-gradient(180deg,rgba(29,185,84,0.06) 0%,transparent 100%)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
              style={{ background: `${color}1a`, border: `1px solid ${color}40`, color }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: color }} />
              Updating every hour
            </span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]" style={{ color }}>
            {label}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            {regionName} · Updated 47 min ago
          </p>
        </div>

        {/* Chart */}
        <div className="mp-card">
          {/* Desktop column headers */}
          <div className="hidden md:grid items-center px-[22px] h-9 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '52px 48px 1fr 100px 110px 80px' }}>
            {['#', '', 'Song', 'Streams', 'Peak', 'Weeks'].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">{h}</div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden md:block">
            {entries.map(entry => (
              <div key={entry.id}
                className="grid items-center px-[22px] h-[66px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]"
                style={{ gridTemplateColumns: '52px 48px 1fr 100px 110px 80px' }}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn('text-[16px] font-black tracking-[-0.03em] leading-none',
                    entry.position === 1 ? 'rank-gold' : entry.position === 2 ? 'rank-silver' : entry.position === 3 ? 'rank-bronze' : entry.isNewEntry ? 'text-[var(--blue)]' : 'text-[var(--text3)]')}>
                    {entry.position}
                  </span>
                  <span className={cn('text-[10px] font-bold flex items-center gap-0.5',
                    entry.isNewEntry ? 'text-[var(--blue)]' : entry.positionChange > 0 ? 'text-[var(--green)]' : entry.positionChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                    {entry.isNewEntry ? 'NEW' : entry.positionChange > 0 ? `↑${entry.positionChange}` : entry.positionChange < 0 ? `↓${Math.abs(entry.positionChange)}` : '—'}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] mx-1"
                  style={{ background: entry.song.artGradient ?? 'var(--bg3)' }}>
                  {(entry.song as any).artEmoji ?? '🎵'}
                </div>
                <div className="pl-3.5 min-w-0">
                  <div className="text-[14px] font-bold tracking-[-0.02em] truncate">{entry.song.title}</div>
                  <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">{entry.song.artistName}</div>
                </div>
                <div className="pl-2 text-[13px] font-semibold text-[var(--text2)]">
                  {entry.streams ? formatCount(entry.streams) : '—'}
                </div>
                <div className="pl-2">
                  <div className={cn('text-[13px] font-bold flex items-center gap-1',
                    entry.peakPosition === 1 ? 'text-[var(--gold)]' : 'text-[var(--text2)]')}>
                    {entry.peakPosition === 1 && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <polygon points="5,0.5 6.2,3.6 9.5,3.8 7,6.1 7.9,9.4 5,7.7 2.1,9.4 3,6.1 0.5,3.8 3.8,3.6" fill="currentColor" />
                      </svg>
                    )}
                    #{entry.peakPosition}
                  </div>
                </div>
                <div className="pl-2">
                  <div className="text-[18px] font-black tracking-[-0.03em] text-[var(--text)]">{entry.weeksOnChart}</div>
                  <div className="text-[10px] text-[var(--text3)] font-medium mt-0.5">weeks</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile rows */}
          <div className="md:hidden">
            {entries.map(entry => (
              <div key={entry.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]">
                <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                  <span className={cn('text-[15px] font-black tracking-[-0.03em] leading-none',
                    entry.position === 1 ? 'rank-gold' : entry.position === 2 ? 'rank-silver' : entry.position === 3 ? 'rank-bronze' : entry.isNewEntry ? 'text-[var(--blue)]' : 'text-[var(--text3)]')}>
                    {entry.position}
                  </span>
                  <span className={cn('text-[9px] font-bold flex items-center gap-0.5',
                    entry.isNewEntry ? 'text-[var(--blue)]' : entry.positionChange > 0 ? 'text-[var(--green)]' : entry.positionChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                    {entry.isNewEntry ? 'NEW' : entry.positionChange > 0 ? `↑${entry.positionChange}` : entry.positionChange < 0 ? `↓${Math.abs(entry.positionChange)}` : '—'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0"
                  style={{ background: entry.song.artGradient ?? 'var(--bg3)' }}>
                  {(entry.song as any).artEmoji ?? '🎵'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold tracking-[-0.02em] truncate">{entry.song.title}</div>
                  <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">{entry.song.artistName}</div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                  <span className="text-[12px] font-semibold text-[var(--text2)]">
                    {entry.streams ? formatCount(entry.streams) : '—'}
                  </span>
                  <span className={cn('text-[10px] font-bold',
                    entry.peakPosition === 1 ? 'text-[var(--gold)]' : 'text-[var(--text3)]')}>
                    Peak #{entry.peakPosition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
