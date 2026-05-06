'use client'

import type { Album } from '@/types'
import { cn, formatDate } from '@/lib/utils'

interface ReleasesGridProps {
  albums: Album[]
}

const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  album:  { text: 'var(--blue)',  bg: 'var(--blue-dim)' },
  ep:     { text: 'var(--purple)', bg: 'var(--purple-dim)' },
  single: { text: 'var(--gold)',  bg: 'var(--gold-dim)' },
  compilation: { text: 'var(--green)', bg: 'var(--green-dim)' },
}

const TYPE_GRADIENTS = [
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#642b73,#c6426e)',
  'linear-gradient(135deg,#134e5e,#71b280)',
  'linear-gradient(135deg,#4b1248,#f10711)',
  'linear-gradient(135deg,#1a4a6e,#2196f3)',
  'linear-gradient(135deg,#c94b4b,#4b134f)',
  'linear-gradient(135deg,#0f2027,#2c5364)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
]

const ALBUM_EMOJIS = ['💿', '🎵', '🎶', '🎤', '🎧', '🎹', '🎸', '🥁']

export function ReleasesGrid({ albums }: ReleasesGridProps) {
  if (albums.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
      {albums.map((album, i) => {
        const typeStyle = TYPE_COLORS[album.type] ?? TYPE_COLORS.album
        const gradient = TYPE_GRADIENTS[i % TYPE_GRADIENTS.length]
        const emoji = ALBUM_EMOJIS[i % ALBUM_EMOJIS.length]

        return (
          <a
            key={album.id}
            href={`/songs/${album.slug}`}
            className={cn(
              'mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
              'animate-fade-up',
              `delay-${(i % 5) + 1}`,
            )}
          >
            {/* Album art */}
            <div
              className="aspect-square flex items-center justify-center text-[40px] relative overflow-hidden"
              style={{ background: album.coverUrl ? 'var(--bg3)' : gradient }}
            >
              {album.coverUrl ? (
                <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {emoji}
                </span>
              )}

              {/* Type badge overlay */}
              <span
                className="absolute top-2.5 right-2.5 text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border"
                style={{
                  color: typeStyle.text,
                  background: typeStyle.bg,
                  borderColor: typeStyle.text.replace(')', ',0.25)').replace('var(', 'rgba('),
                }}
              >
                {album.type}
              </span>

              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-10 h-10 rounded-full bg-[var(--green)] flex items-center justify-center shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#000">
                    <polygon points="5,3 13,8 5,13" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5 sm:p-3.5">
              <p className="text-[12px] sm:text-[13px] font-semibold text-[var(--text)] truncate">
                {album.title}
              </p>
              <p className="text-[11px] text-[var(--text3)] truncate mt-0.5">
                {album.artistName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-[var(--text3)]">
                  {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
                </span>
                <span className="text-[var(--border2)]">·</span>
                <span className="text-[10px] text-[var(--text3)]">
                  {formatDate(album.releaseDate)}
                </span>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
