'use client'

import type { TrendingItem, TrendingPlatform } from '@/types'
import { cn, formatCount } from '@/lib/utils'
import { Badge, LiveDot } from '@/components/ui'

interface TrendingRowProps {
  tiktok: TrendingItem[]
  twitter: TrendingItem[]
  youtube: TrendingItem[]
}

const PLATFORM_META: Record<TrendingPlatform, { label: string; icon: string; color: string; dim: string }> = {
  tiktok:  { label: 'TikTok',      icon: '🎵', color: 'var(--pink)',  dim: 'var(--pink-dim)' },
  twitter: { label: 'X / Twitter',  icon: '𝕏',  color: 'var(--blue)',  dim: 'var(--blue-dim)' },
  youtube: { label: 'YouTube',      icon: '▶️', color: 'var(--pink)',  dim: 'var(--pink-dim)' },
  spotify: { label: 'Spotify',     icon: '🎶', color: 'var(--green)', dim: 'var(--green-dim)' },
}

const BADGE_VARIANT_MAP: Record<string, 'green' | 'pink' | 'gold' | 'purple' | 'blue'> = {
  hot: 'pink',
  rising: 'green',
  new: 'gold',
  peak: 'purple',
}

function TrendingCard({
  items,
  platform,
}: {
  items: TrendingItem[]
  platform: TrendingPlatform
}) {
  const meta = PLATFORM_META[platform]

  return (
    <div className="mp-card flex-1 min-w-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[15px]">{meta.icon}</span>
          <h3 className="text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">
            {meta.label}
          </h3>
          <LiveDot color={meta.color} />
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-[var(--border)]">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'relative flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg3)] overflow-hidden animate-fade-up',
              `delay-${i + 1}`,
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                'text-[14px] font-black tracking-[-0.03em] w-5 text-center flex-shrink-0',
                item.rank === 1
                  ? 'rank-gold'
                  : item.rank === 2
                    ? 'rank-silver'
                    : item.rank === 3
                      ? 'rank-bronze'
                      : 'text-[var(--text3)]',
              )}
            >
              {item.rank}
            </span>

            {/* Art emoji placeholder */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[16px]"
              style={{
                background: item.artGradient ?? 'var(--bg3)',
              }}
            >
              {item.artEmoji ?? '🎶'}
            </div>

            {/* Song info */}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[var(--text)] truncate">
                {item.songTitle}
              </p>
              <p className="text-[10px] text-[var(--text3)] truncate">
                {item.artistName}
              </p>
            </div>

            {/* Metric + badge */}
            <div className="flex flex-col items-end flex-shrink-0 gap-1">
              <span className="text-[11px] font-bold text-[var(--text2)]">
                {formatCount(item.metric)} {item.metricUnit}
              </span>
              {item.badge && (
                <Badge variant={BADGE_VARIANT_MAP[item.badge] ?? 'ghost'} className="!px-2 !py-0.5 !text-[9px]">
                  {item.badge.toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Surge bar */}
            {item.surgePercent != null && item.surgePercent > 0 && (
              <div
                className="surge-bar"
                style={{
                  width: `${item.surgePercent}%`,
                  background: meta.color,
                  opacity: 0.35,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendingRow({ tiktok, twitter, youtube }: TrendingRowProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin">
      <div className="snap-start">
        <TrendingCard items={tiktok} platform="tiktok" />
      </div>
      <div className="snap-start">
        <TrendingCard items={twitter} platform="twitter" />
      </div>
      <div className="snap-start">
        <TrendingCard items={youtube} platform="youtube" />
      </div>
    </div>
  )
}
