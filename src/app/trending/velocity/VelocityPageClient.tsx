'use client'

import type { VelocityItem } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  velocity: VelocityItem[]
}

export function VelocityPageClient({ velocity }: Props) {
  return (
    <div className="relative z-10">
      <div className="live-gradient-bar" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12 pb-10 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-9">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-[0.1em] uppercase"
              style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.25)', color: '#ff6b1a' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#ff6b1a' }} />
              LIVE
            </span>
            <span className="text-[10px] sm:text-[12px] font-medium text-[var(--text3)]">Updated every 2h</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
            Viral Velocity
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
            The fastest-rising songs across all platforms — tracks gaining momentum right now.
          </p>
        </div>

        {/* List */}
        <div className="mp-card">
          <div className="hidden sm:grid items-center px-[22px] h-10 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '50px 48px 1fr 100px 90px' }}>
            {['#', '', 'Song', 'Context', 'Growth'].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">{h}</div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden sm:block">
            {velocity.map(v => (
              <div key={v.rank} className="grid items-center px-[22px] h-[62px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]"
                style={{ gridTemplateColumns: '50px 48px 1fr 100px 90px' }}>
                <div className="text-center">
                  <span className={cn('text-[16px] font-black tracking-[-0.03em] leading-none',
                    v.rank === 1 ? 'rank-gold' : v.rank === 2 ? 'rank-silver' : v.rank === 3 ? 'rank-bronze' : 'text-[var(--text3)]')}>
                    {v.rank}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)]"
                  style={{ background: v.artGradient ?? 'var(--bg3)' }}>
                  {v.artEmoji}
                </div>
                <div className="pl-3 min-w-0">
                  <div className="text-[14px] font-bold tracking-[-0.02em] truncate">{v.songTitle}</div>
                  <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">{v.artistName}</div>
                </div>
                <div className="pl-2 text-[13px] font-medium text-[var(--text3)] truncate">{v.context}</div>
                <div className="pl-2 text-[15px] font-bold tracking-[-0.02em]"
                  style={{ color: v.rank <= 2 ? '#ff6b1a' : v.rank === 3 ? '#f5c842' : '#1DB954' }}>
                  {v.growthPercent === null ? '+∞%' : `+${v.growthPercent}%`}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile rows */}
          <div className="sm:hidden">
            {velocity.map(v => (
              <div key={v.rank} className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)]">
                <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                  <span className={cn('text-[15px] font-black tracking-[-0.03em] leading-none',
                    v.rank === 1 ? 'rank-gold' : v.rank === 2 ? 'rank-silver' : v.rank === 3 ? 'rank-bronze' : 'text-[var(--text3)]')}>
                    {v.rank}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0"
                  style={{ background: v.artGradient ?? 'var(--bg3)' }}>
                  {v.artEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold tracking-[-0.02em] truncate">{v.songTitle}</div>
                  <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">{v.artistName}</div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <div className="text-[14px] font-bold tracking-[-0.02em]"
                    style={{ color: v.rank <= 2 ? '#ff6b1a' : v.rank === 3 ? '#f5c842' : '#1DB954' }}>
                    {v.growthPercent === null ? '+∞%' : `+${v.growthPercent}%`}
                  </div>
                  <div className="text-[10px] text-[var(--text3)] font-medium mt-0.5">{v.context}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
