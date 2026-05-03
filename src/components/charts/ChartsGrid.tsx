'use client'

import type { ChartEntry } from '@/types'
import { cn, formatCount, formatRankChange, PLATFORM_LABELS } from '@/lib/utils'
import { LiveDot } from '@/components/ui'
import { MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

interface ChartsGridProps {
  spotifyEntries: ChartEntry[]
  appleEntries: ChartEntry[]
}

const RANK_COLORS: Record<number, string> = {
  1: 'rank-gold',
  2: 'rank-silver',
  3: 'rank-bronze',
}

const PLATFORM_ACCENT: Record<string, { color: string; dim: string }> = {
  spotify: { color: '#1DB954', dim: 'rgba(29,185,84,0.1)' },
  apple:   { color: '#fc3c44', dim: 'rgba(252,60,68,0.1)' },
}

function ChartCard({
  entries,
  platform,
}: {
  entries: ChartEntry[]
  platform: 'spotify' | 'apple'
}) {
  const accent = PLATFORM_ACCENT[platform]
  const label = PLATFORM_LABELS[platform] ?? platform

  return (
    <div className="mp-card flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center"><MiniPlatformIcon platform={platform} size={16} /></span>
          <h3 className="text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">
            {label}
          </h3>
          <LiveDot color={accent.color} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text3)]">
          Global
        </span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-[var(--border)]">
        {entries.slice(0, 7).map((entry, i) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors hover:bg-[var(--bg3)] animate-fade-up',
              `delay-${i + 1}`,
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                'text-[16px] font-black tracking-[-0.03em] w-6 text-center flex-shrink-0',
                RANK_COLORS[entry.position] ?? 'text-[var(--text3)]',
              )}
            >
              {entry.position}
            </span>

            {/* Song info */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                {entry.song.title}
              </p>
              <p className="text-[11px] text-[var(--text3)] truncate">
                {entry.song.artistName}
              </p>
            </div>

            {/* Position change + streams */}
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
              <span
                className={cn(
                  'text-[11px] font-bold',
                  entry.positionChange > 0
                    ? 'text-[var(--green)]'
                    : entry.positionChange < 0
                      ? 'text-[var(--pink)]'
                      : 'text-[var(--text3)]',
                )}
              >
                {formatRankChange(entry.positionChange, entry.isNewEntry)}
              </span>
              {entry.streams != null && (
                <span className="text-[10px] text-[var(--text3)]">
                  {formatCount(entry.streams)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartsGrid({ spotifyEntries, appleEntries }: ChartsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartCard entries={spotifyEntries} platform="spotify" />
      <ChartCard entries={appleEntries} platform="apple" />
    </div>
  )
}
