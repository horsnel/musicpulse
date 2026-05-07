'use client'

import Link from 'next/link'
import type { TrendingItem, TrendingPlatform } from '@/types'
import { cn, formatCount, slugify } from '@/lib/utils'
import { Badge, LiveDot } from '@/components/ui'
import { MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

interface TrendingRowProps {
  tiktok: TrendingItem[]
  twitter: TrendingItem[]
  youtube: TrendingItem[]
}

const PLATFORM_META: Record<TrendingPlatform, { label: string; color: string; dim: string }> = {
  tiktok:     { label: 'TikTok',      color: '#ff2d6b',  dim: 'rgba(255,45,107,0.1)' },
  twitter:    { label: 'X',           color: '#e0e0e0',  dim: 'rgba(200,200,200,0.1)' },
  youtube:    { label: 'YouTube',      color: '#FF0000',  dim: 'rgba(255,0,0,0.1)' },
  spotify:    { label: 'Spotify',     color: '#1DB954',  dim: 'rgba(29,185,84,0.1)' },
  apple:      { label: 'Apple Music', color: '#fc3c44',  dim: 'rgba(252,60,68,0.1)' },
  soundcloud: { label: 'SoundCloud',  color: '#FF5500',  dim: 'rgba(255,85,0,0.1)' },
  billboard:  { label: 'Billboard',   color: '#E60026',  dim: 'rgba(230,0,38,0.1)' },
  deezer:     { label: 'Deezer',      color: '#A238FF',  dim: 'rgba(162,56,255,0.1)' },
  bandcamp:   { label: 'Bandcamp',    color: '#629AA9',  dim: 'rgba(98,154,169,0.1)' },
  audiomack:  { label: 'Audiomack',   color: '#FFA200',  dim: 'rgba(255,162,0,0.1)' },
  genius:     { label: 'Genius',      color: '#FFFF64',  dim: 'rgba(255,255,100,0.1)' },
  musixmatch: { label: 'Musixmatch',  color: '#FF6E40',  dim: 'rgba(255,110,64,0.1)' },
  iheart:     { label: 'iHeartRadio', color: '#C6002B',  dim: 'rgba(198,0,43,0.1)' },
  melon:      { label: 'Melon',        color: '#00CD3C',  dim: 'rgba(0,205,60,0.1)' },
  oricon:     { label: 'Oricon',       color: '#CC0000',  dim: 'rgba(204,0,0,0.1)' },
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
    <div className="mp-card flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center"><MiniPlatformIcon platform={platform} size={16} /></span>
          <h3 className="text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">
            {meta.label}
          </h3>
          <LiveDot color={meta.color} />
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-[var(--border)]">
        {items.map((item, i) => {
          const songSlug = slugify(item.songTitle + '-' + item.artistName)
          return (
          <Link
            key={item.id}
            href={`/songs/${songSlug}`}
            className={cn(
              'relative flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 transition-colors hover:bg-[var(--bg3)] overflow-hidden animate-fade-up no-underline text-inherit',
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

            {/* Album artwork */}
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[14px] sm:text-[16px] border border-[rgba(255,255,255,0.05)] overflow-hidden"
              style={{
                background: item.albumCoverUrl ? 'var(--bg3)' : (item.artGradient ?? 'var(--bg3)'),
              }}
            >
              {item.albumCoverUrl ? (
                <img src={item.albumCoverUrl} alt={item.songTitle} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                item.artEmoji ?? '🎶'
              )}
            </div>

            {/* Song info + badge (inline, no overlap) */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] sm:text-[12px] font-semibold text-[var(--text)] truncate">
                  {item.songTitle}
                </p>
                {item.badge && (
                  <Badge variant={BADGE_VARIANT_MAP[item.badge] ?? 'ghost'} className="!px-1.5 !py-0 !text-[7px] sm:!text-[8px] flex-shrink-0">
                    {item.badge.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-[var(--text3)] truncate">
                {item.artistName}
              </p>
            </div>

            {/* Metric — with left padding to separate from badges */}
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5 pl-2">
              <span className="text-[11px] font-bold text-[var(--text2)]">
                {formatCount(item.metric)} {item.metricUnit}
              </span>
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
          </Link>
          )
        })}
      </div>
    </div>
  )
}

export function TrendingRow({ tiktok, twitter, youtube }: TrendingRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TrendingCard items={tiktok} platform="tiktok" />
      <TrendingCard items={twitter} platform="twitter" />
      <TrendingCard items={youtube} platform="youtube" />
    </div>
  )
}
