import type { Metadata } from 'next'
import { getGenres } from '@/lib/data'
import { GenrePills } from '@/components/ui/GenrePills'
import type { Genre } from '@/types'

export const metadata: Metadata = {
  title: 'Browse Genres',
  description: 'Explore music by genre — from Afrobeats and K-Pop to Hip-Hop and Electronic. Find your sound.',
}

/** Map genre slugs to emojis for visual flair */
const GENRE_EMOJIS: Record<string, string> = {
  pop: '🎤',
  'hip-hop-rap': '🎧',
  'r-b-soul': '🎵',
  country: '🤠',
  electronic: '⚡',
  dance: '💃',
  latin: '🔥',
  rock: '🎸',
  alternative: '🌿',
  'k-pop': '🌸',
  afrobeats: '🌍',
  'singer-songwriter': '🎹',
  blues: '🎷',
  christian: '✝️',
  reggae: '🏝️',
  metal: '🤘',
  'hard-rock': '🔥',
  'fitness-workout': '💪',
  folk: '🪕',
  worldwide: '🌍',
  jazz: '🎺',
  classical: '🎻',
  gospel: '🙏',
  world: '🌍',
  indian: '🇮🇳',
}

function getGenreEmoji(slug: string): string {
  return GENRE_EMOJIS[slug] ?? '🎵'
}

export default async function GenresPage() {
  const genres = await getGenres()

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 60% 40%, rgba(255,184,48,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,184,48,0.25)', color: 'var(--gold)' }}>
            Find Your Sound
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Browse by Genre
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Explore the full spectrum of music — from Afrobeats and Amapiano to Drill and Electronic. Every genre, every vibe.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-10" />

        {/* Quick filter pills */}
        <div className="mb-12">
          <GenrePills />
        </div>

        {/* Genre cards grid — data-driven from API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.map((genre: Genre) => (
            <a
              key={genre.slug}
              href={`/genres/${genre.slug}`}
              className="mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl no-underline"
            >
              {/* Gradient header with genre color */}
              <div
                className="h-[100px] flex items-center justify-center text-[44px] relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${genre.color}cc, ${genre.color}44)` }}
              >
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {getGenreEmoji(genre.slug)}
                </span>
                {/* Decorative circle */}
                <div
                  className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
                  style={{ background: genre.color }}
                />
              </div>
              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[var(--text)] group-hover:text-[var(--green)] transition-colors">
                    {genre.name}
                  </h3>
                  <span
                    className="text-[11px] font-bold tracking-[0.04em] px-2.5 py-0.5 rounded-full"
                    style={{ background: `${genre.color}20`, color: genre.color }}
                  >
                    {genre.songCount} songs
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: genre.color }}
                  />
                  <span className="text-[13px] text-[var(--text3)] font-medium">
                    Top charts curated for {genre.name}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
