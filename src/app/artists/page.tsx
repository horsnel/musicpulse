import type { Metadata } from 'next'
import { getTopArtists } from '@/lib/data'
import { formatCount } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Top Artists',
  description: 'Explore the world\'s top music artists — monthly listeners, genres, and chart performance from Spotify, Apple Music, and more.',
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#642b73,#c6426e)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#134e5e,#71b280)',
  'linear-gradient(135deg,#4b1248,#f10711)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
  'linear-gradient(135deg,#1a4a6e,#2196f3)',
]

export default async function ArtistsPage() {
  const artists = await getTopArtists(12)

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 60% 40%, rgba(176,108,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--purple-dim)', border: '1px solid rgba(176,108,255,0.25)', color: 'var(--purple)' }}>
            Artist Spotlight
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Top Artists
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            The artists dominating global charts right now — ranked by monthly listeners and cross-platform impact.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-8 sm:mb-10" />

        {/* Artists grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-8">
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
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="group no-underline text-center"
              >
                {/* Avatar */}
                <div className="relative mb-4 inline-block">
                  <div
                    className="w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] rounded-full flex items-center justify-center text-[22px] sm:text-[30px] font-extrabold text-white/90 transition-transform duration-300 group-hover:scale-105 mx-auto"
                    style={{ background: gradient }}
                  >
                    {initials}
                  </div>
                  {artist.verified && (
                    <div className="absolute bottom-1 right-3 w-6 h-6 rounded-full bg-[var(--blue)] flex items-center justify-center border-2 border-[var(--bg)]">
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
                <p className="text-[12px] text-[var(--text3)] mt-1">
                  {formatCount(artist.monthlyListeners)} listeners
                </p>

                {/* Genre tags */}
                {artist.genres.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
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
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
