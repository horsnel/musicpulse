'use client'

import { cn } from '@/lib/utils'

interface GenrePill {
  label: string
  emoji: string
  gradient: string
}

const GENRES: GenrePill[] = [
  { label: 'Pop',       emoji: '🎤', gradient: 'linear-gradient(135deg,#642b73,#c6426e)' },
  { label: 'Hip-Hop',  emoji: '🎧', gradient: 'linear-gradient(135deg,#4b1248,#f10711)' },
  { label: 'Afrobeats', emoji: '🌍', gradient: 'linear-gradient(135deg,#1a1000,#3a2800)' },
  { label: 'K-Pop',    emoji: '🌸', gradient: 'linear-gradient(135deg,#6a1a6e,#b06cff)' },
  { label: 'Latin',    emoji: '💃', gradient: 'linear-gradient(135deg,#b85500,#ff8c00)' },
  { label: 'R&B',      emoji: '🎵', gradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)' },
  { label: 'Amapiano', emoji: '🎹', gradient: 'linear-gradient(135deg,#0f2027,#2c5364)' },
  { label: 'Dancehall', emoji: '🏝️', gradient: 'linear-gradient(135deg,#134e5e,#71b280)' },
  { label: 'Reggaeton', emoji: '🔥', gradient: 'linear-gradient(135deg,#c94b4b,#4b134f)' },
  { label: 'Drill',    emoji: '🥊', gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  { label: 'Indie',    emoji: '🎸', gradient: 'linear-gradient(135deg,#2d1b69,#11998e)' },
  { label: 'Electronic', emoji: '⚡', gradient: 'linear-gradient(135deg,#0a0a2e,#1e3a8a)' },
]

export function GenrePills() {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      {GENRES.map((genre, i) => (
        <button
          key={genre.label}
          className={cn(
            'group flex items-center gap-2 sm:gap-2.5 pl-1 pr-3 sm:pr-4 py-0.5 sm:py-1 rounded-full',
            'border border-[var(--border)] bg-[var(--bg2)]',
            'transition-all duration-200 hover:border-[var(--border2)] hover:-translate-y-0.5 hover:shadow-lg',
            'cursor-pointer animate-fade-up',
            `delay-${(i % 5) + 1}`,
          )}
        >
          {/* Emoji circle */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] sm:text-[14px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ background: genre.gradient }}
          >
            {genre.emoji}
          </div>
          <span className="text-[11px] sm:text-[13px] font-semibold text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
            {genre.label}
          </span>
        </button>
      ))}
    </div>
  )
}
