'use client'

import type { Artist } from '@/types'
import { cn, formatCount } from '@/lib/utils'
import { ArtistAvatar } from './ArtistAvatar'

interface ArtistsRowProps {
  artists: Artist[]
}

export function ArtistsRow({ artists }: ArtistsRowProps) {
  if (artists.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 sm:gap-6">
      {artists.map((artist, i) => (
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
            <ArtistAvatar name={artist.name} imageUrl={artist.imageUrl} index={i} />

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
      ))}
    </div>
  )
}
