'use client'

import type { CrossPlatformScore } from '@/types'
import { cn } from '@/lib/utils'
import { MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

interface Props {
  crossPlatform: CrossPlatformScore[]
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    tiktok:  { bg: 'rgba(255,45,107,0.12)',  color: '#ff2d6b',  label: 'TikTok' },
    twitter: { bg: 'rgba(200,200,200,0.12)',  color: '#e0e0e0',  label: 'X' },
    youtube: { bg: 'rgba(255,0,0,0.12)',      color: '#FF0000',  label: 'YouTube' },
    spotify: { bg: 'rgba(29,185,84,0.12)',    color: '#1DB954',  label: 'Spotify' },
  }
  const c = colors[platform] ?? { bg: 'var(--bg3)', color: 'var(--text3)', label: platform }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: c.bg, color: c.color }}>
      <MiniPlatformIcon platform={platform as any} size={10} />
      {c.label}
    </span>
  )
}

export function CrossPlatformPageClient({ crossPlatform }: Props) {
  return (
    <div className="relative z-10">
      <div className="live-gradient-bar" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-[0.1em] uppercase"
              style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', color: '#f5c842' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#f5c842' }} />
              LIVE
            </span>
            <span className="text-[10px] sm:text-[12px] font-medium text-[var(--text3)]">Updated every 2h</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
            Cross-Platform Power Score
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            Songs dominating across TikTok, X, YouTube, and Spotify — ranked by their combined power.
          </p>
        </div>

        {/* List */}
        <div className="mp-card">
          <div className="hidden sm:grid items-center px-[22px] h-10 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '50px 48px 1fr 160px 80px' }}>
            {['#', '', 'Song', 'Platforms', 'Score'].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">{h}</div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden sm:block">
            {crossPlatform.map((cp, idx) => (
              <div key={cp.songId} className="grid items-center px-[22px] h-[62px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]"
                style={{ gridTemplateColumns: '50px 48px 1fr 160px 80px' }}>
                <div className="text-center">
                  <span className={cn('text-[16px] font-black tracking-[-0.03em] leading-none',
                    idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'text-[var(--text3)]')}>
                    {idx + 1}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)]"
                  style={{ background: cp.artGradient ?? 'var(--bg3)' }}>
                  {cp.artEmoji}
                </div>
                <div className="pl-3 min-w-0">
                  <div className="text-[14px] font-bold tracking-[-0.02em] truncate">{cp.songTitle}</div>
                  <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">{cp.artistName}</div>
                </div>
                <div className="pl-2 flex items-center gap-1.5 flex-wrap">
                  {cp.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
                </div>
                <div className="pl-2">
                  <div className="text-[20px] font-bold text-[var(--text)] tracking-[-0.03em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cp.score}</div>
                  <div className="text-[9.5px] font-semibold text-[var(--text3)] tracking-[0.06em] uppercase mt-0.5">Power</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile rows */}
          <div className="sm:hidden">
            {crossPlatform.map((cp, idx) => (
              <div key={cp.songId} className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]">
                <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                  <span className={cn('text-[15px] font-black tracking-[-0.03em] leading-none',
                    idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'text-[var(--text3)]')}>
                    {idx + 1}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0"
                  style={{ background: cp.artGradient ?? 'var(--bg3)' }}>
                  {cp.artEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold tracking-[-0.02em] truncate">{cp.songTitle}</div>
                  <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">{cp.artistName}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {cp.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <div className="text-[18px] font-bold text-[var(--text)] tracking-[-0.03em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cp.score}</div>
                  <div className="text-[9px] font-semibold text-[var(--text3)] tracking-[0.06em] uppercase mt-0.5">Power</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
