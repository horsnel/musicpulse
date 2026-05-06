'use client'

import type { ChartEntry } from '@/types'
import { cn, formatCount, formatRankChange } from '@/lib/utils'
import { PlayingBars, Badge } from '@/components/ui'

interface HeroSectionProps {
  spotifyTop5: ChartEntry[]
}

const RANK_COLORS: Record<number, string> = {
  1: 'rank-gold',
  2: 'rank-silver',
  3: 'rank-bronze',
}

export function HeroSection({ spotifyTop5 }: HeroSectionProps) {
  const topSong = spotifyTop5[0]
  if (!topSong) return null

  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(29,185,84,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 70% 60%, rgba(67,97,255,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 py-10 sm:py-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* #1 Song — Hero Card */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-5 mb-3 sm:mb-4">
              {/* #1 Song artwork */}
              {topSong.song.albumCoverUrl ? (
                <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-xl flex-shrink-0 overflow-hidden border border-[rgba(255,255,255,0.05)]"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}>
                  <img src={topSong.song.albumCoverUrl} alt={topSong.song.title} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div>
                <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                  <PlayingBars />
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--green)]">
                    #1 on Spotify Global
                  </span>
                </div>

                <h1 className="text-[clamp(1.6rem,5vw,3.2rem)] font-black tracking-[-0.04em] leading-[1.1] text-[var(--text)] mb-2">
                  {topSong.song.title}
                </h1>

                <p className="text-[16px] sm:text-[18px] font-semibold text-[var(--text2)] mb-4 sm:mb-5">
                  {topSong.song.artistName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
              {topSong.streams != null && (
                <Badge variant="green">
                  {formatCount(topSong.streams)} streams
                </Badge>
              )}
              <Badge variant="ghost">
                Peak #{topSong.peakPosition}
              </Badge>
              <Badge variant="ghost">
                {topSong.weeksOnChart}w on chart
              </Badge>
              {topSong.isNewEntry && <Badge variant="pink">NEW</Badge>}
            </div>

            {topSong.song.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topSong.song.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[var(--bg3)] border border-[var(--border)] text-[var(--text3)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Top 5 List */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="mp-card">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--border)]">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">
                  Spotify Top 5
                </h3>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text3)]">
                  Global
                </span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {spotifyTop5.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-3 sm:gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-[var(--bg3)] animate-fade-up',
                      `delay-${i + 1}`,
                    )}
                  >
                    {/* Rank */}
                    <span
                      className={cn(
                        'text-[16px] sm:text-[18px] font-black tracking-[-0.03em] w-6 text-center flex-shrink-0',
                        RANK_COLORS[entry.position] ?? 'text-[var(--text3)]',
                      )}
                    >
                      {entry.position}
                    </span>

                    {/* Album artwork */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.05)] overflow-hidden"
                      style={{ background: entry.song.albumCoverUrl ? 'var(--bg3)' : 'var(--bg3)' }}
                    >
                      {entry.song.albumCoverUrl ? (
                        <img src={entry.song.albumCoverUrl} alt={entry.song.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-[16px]">🎵</span>
                      )}
                    </div>

                    {/* Song info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-[var(--text)] truncate">
                        {entry.song.title}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[var(--text3)] truncate">
                        {entry.song.artistName}
                      </p>
                    </div>

                    {/* Position change + streams */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      <span
                        className={cn(
                          'text-[10px] sm:text-[11px] font-bold',
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
                        <span className="text-[9px] sm:text-[10px] text-[var(--text3)]">
                          {formatCount(entry.streams)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
