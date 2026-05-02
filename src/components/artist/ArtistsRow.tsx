'use client'

import type { Artist } from '@/types'
import { cn, formatCount } from '@/lib/utils'

interface ArtistsRowProps {
  artists: Artist[]
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#642b73,#c6426e)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#134e5e,#71b280)',
  'linear-gradient(135deg,#4b1248,#f10711)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
  'linear-gradient(135deg,#1a4a6e,#2196f3)',
  'linear-gradient(135deg,#c94b4b,#4b134f)',
  'linear-gradient(135deg,#0f2027,#2c5364)',
]

export function ArtistsRow({ artists }: ArtistsRowProps) {
  if (artists.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 sm:gap-6">
      {artists.map((artist, i) => {
        const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
        const initials = artist.name
          .split(/[\s,]+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()

        return (
          <a
            key={artist.id}
            href={`/artists/${artist.slug}`}
            className={cn(
              'group text-center',
              'animate-fade-up',
              `delay-${(i % 5) + 1}`,
            )}
          >
            {/* Avatar */}
            <div className="relative mb-3 inline-block">
              <div
                className="w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] rounded-full flex items-center justify-center text-[22px] sm:text-[30px] font-extrabold text-white/90 transition-transform duration-300 group-hover:scale-105 mx-auto"
                style={{ background: gradient }}
              >
                {initials}
              </div>

              {/* Verified badge */}
              {artist.verified && (
                <div className="absolute bottom-1 right-4 w-6 h-6 rounded-full bg-[var(--blue)] flex items-center justify-center border-2 border-[var(--bg)]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff">
                    <path d="M4.5 8.3L2.2 6l1-1 1.3 1.3 3.3-3.3 1 1L4.5 8.3z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <p className="text-[14px] font-semibold text-[var(--text)] truncate group-hover:text-[var(--green)] transition-colors">
              {artist.name}
            </p>
            <p className="text-[12px] text-[var(--text3)] mt-0.5">
              {formatCount(artist.monthlyListeners)} listeners
            </p>

            {/* Genre tags */}
            {artist.genres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                {artist.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--bg3)] text-[var(--text3)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </a>
        )
      })}
    </div>
  )
}
