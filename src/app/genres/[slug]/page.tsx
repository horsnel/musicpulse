import type { Metadata } from 'next'
import { getGenreChart, getGenres } from '@/lib/data'
import { formatCount } from '@/lib/utils'
import type { ChartEntry, Genre } from '@/types'

interface Props {
  params: { slug: string }
}

const GENRE_EMOJIS: Record<string, string> = {
  pop: '🎤', 'hip-hop-rap': '🎧', 'r-b-soul': '🎵', country: '🤠',
  electronic: '⚡', dance: '💃', latin: '🔥', rock: '🎸',
  alternative: '🌿', 'k-pop': '🌸', afrobeats: '🌍', 'singer-songwriter': '🎹',
  blues: '🎷', christian: '✝️', reggae: '🏝️', metal: '🤘',
  'hard-rock': '🔥', 'fitness-workout': '💪', folk: '🪕', worldwide: '🌍',
  jazz: '🎺', classical: '🎻', gospel: '🙏', world: '🌍', indian: '🇮🇳',
}

const GENRE_NAMES: Record<string, string> = {
  pop: 'Pop', 'hip-hop-rap': 'Hip-Hop / Rap', 'r-b-soul': 'R&B / Soul',
  country: 'Country', electronic: 'Electronic', dance: 'Dance',
  latin: 'Latin', rock: 'Rock', alternative: 'Alternative',
  'k-pop': 'K-Pop', afrobeats: 'Afrobeats', 'singer-songwriter': 'Singer-Songwriter',
  blues: 'Blues', christian: 'Christian', reggae: 'Reggae', metal: 'Metal',
  'hard-rock': 'Hard Rock', 'fitness-workout': 'Fitness & Workout', folk: 'Folk',
  worldwide: 'Worldwide', jazz: 'Jazz', classical: 'Classical', gospel: 'Gospel',
  world: 'World', indian: 'Indian',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = GENRE_NAMES[params.slug] || params.slug
  return {
    title: `${name} Charts — MusicPulse`,
    description: `Top ${name} songs right now. Real-time ${name} charts with streaming stats, trending tracks, and more.`,
  }
}

export async function generateStaticParams() {
  const genres = await getGenres()
  return genres.map((g: Genre) => ({ slug: g.slug }))
}

export default async function GenreDetailPage({ params }: Props) {
  const [entries, genres] = await Promise.all([
    getGenreChart(params.slug, 100),
    getGenres(),
  ])

  const genreInfo = genres.find((g: Genre) => g.slug === params.slug)
  const genreName = genreInfo?.name || GENRE_NAMES[params.slug] || params.slug
  const genreColor = genreInfo?.color || '#8B5CF6'
  const genreEmoji = GENRE_EMOJIS[params.slug] || '🎵'

  return (
    <div className="relative z-10">

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${genreColor}40 0%, ${genreColor}18 40%, transparent 100%)` }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${genreColor}08 1px, transparent 1px), linear-gradient(90deg, ${genreColor}08 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-16 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] text-[var(--text3)] font-medium mb-6">
            <a href="/genres" className="hover:text-[var(--text2)] transition-colors no-underline text-[var(--text3)]">Genres</a>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" /></svg>
            <span style={{ color: genreColor }}>{genreName}</span>
          </div>

          <div className="flex items-center gap-5 sm:gap-7">
            {/* Genre icon */}
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-[20px] flex items-center justify-center text-[40px] sm:text-[56px] flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${genreColor}dd, ${genreColor}66)`, boxShadow: `0 20px 60px ${genreColor}30` }}
            >
              {genreEmoji}
            </div>

            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-3"
                style={{ background: `${genreColor}18`, border: `1px solid ${genreColor}30`, color: genreColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: genreColor }} />
                Live Charts
              </span>
              <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1.05] mb-2">
                {genreName}
              </h1>
              <p className="text-[14px] sm:text-[16px] text-[var(--text2)] font-medium">
                {entries.length} songs charting right now
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">

        {/* Chart table */}
        {entries.length > 0 ? (
          <div className="mp-card mt-2">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-4 border-b border-[var(--border)] gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${genreColor}18` }}
                >
                  <span className="text-[18px]">{genreEmoji}</span>
                </div>
                <div>
                  <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em]">{genreName} Top Songs</div>
                  <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium">
                    Based on Apple Music chart data
                  </div>
                </div>
              </div>
              <span
                className="text-[11px] font-bold tracking-[0.04em] px-2.5 py-1 rounded-full"
                style={{ background: `${genreColor}18`, color: genreColor }}
              >
                {entries.length} tracks
              </span>
            </div>

            {/* Desktop column headers */}
            <div className="hidden md:grid items-center px-[22px] h-9 border-b border-[var(--border)] bg-[var(--bg3)]"
              style={{ gridTemplateColumns: '52px 48px 1fr 100px 80px' }}
            >
              {['#', '', 'Song', 'Popularity', 'Peak'].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">
                  {h}
                </div>
              ))}
            </div>

            {/* Desktop rows */}
            <div className="hidden md:block">
              {entries.map((entry: ChartEntry) => (
                <a
                  key={entry.id}
                  href={`/songs/${entry.song.slug}`}
                  className="grid items-center px-[22px] h-[66px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                  style={{ gridTemplateColumns: '52px 48px 1fr 100px 80px' }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[16px] font-black tracking-[-0.03em] leading-none"
                      style={{ color: entry.position <= 3 ? genreColor : 'var(--text3)' }}>
                      {entry.position}
                    </span>
                  </div>
                  <div
                    className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] transition-transform mx-1 overflow-hidden"
                    style={{ background: entry.song.albumCoverUrl ? 'var(--bg3)' : `linear-gradient(135deg, ${genreColor}88, ${genreColor}44)` }}
                  >
                    {entry.song.albumCoverUrl ? (
                      <img src={entry.song.albumCoverUrl} alt={entry.song.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      genreEmoji
                    )}
                  </div>
                  <div className="pl-3.5 min-w-0">
                    <div className="text-[14px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">
                      {entry.song.title}
                    </div>
                    <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      <a href={`/artists/${entry.song.artistSlug}`} className="hover:text-[var(--text2)] transition-colors no-underline text-[var(--text3)]">
                        {entry.song.artistName}
                      </a>
                    </div>
                  </div>
                  <div className="pl-2">
                    <div className="h-1.5 rounded-full bg-[var(--bg3)] w-[80px] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${entry.song.popularityScore || 0}%`, background: genreColor }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text3)] font-medium mt-1">
                      {entry.song.popularityScore || 0}/100
                    </div>
                  </div>
                  <div className="pl-2">
                    <span className="text-[13px] font-bold" style={{ color: entry.peakPosition === 1 ? 'var(--gold)' : 'var(--text2)' }}>
                      #{entry.peakPosition}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Mobile rows */}
            <div className="md:hidden">
              {entries.map((entry: ChartEntry) => (
                <a
                  key={entry.id}
                  href={`/songs/${entry.song.slug}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] no-underline"
                >
                  <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                    <span className="text-[15px] font-black tracking-[-0.03em] leading-none"
                      style={{ color: entry.position <= 3 ? genreColor : 'var(--text3)' }}>
                      {entry.position}
                    </span>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0 overflow-hidden"
                    style={{ background: entry.song.albumCoverUrl ? 'var(--bg3)' : `linear-gradient(135deg, ${genreColor}88, ${genreColor}44)` }}
                  >
                    {entry.song.albumCoverUrl ? (
                      <img src={entry.song.albumCoverUrl} alt={entry.song.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      genreEmoji
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold tracking-[-0.02em] truncate text-[var(--text)]">
                      {entry.song.title}
                    </div>
                    <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      {entry.song.artistName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                    <span className="text-[12px] font-semibold text-[var(--text2)]">
                      #{entry.peakPosition}
                    </span>
                    <span className="text-[10px] text-[var(--text3)] font-medium">
                      {entry.song.popularityScore || 0}%
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="mp-card mt-2 p-10 text-center">
            <div className="text-[48px] mb-4">🎵</div>
            <h2 className="text-[20px] font-bold mb-2">No chart data yet</h2>
            <p className="text-[14px] text-[var(--text3)] font-medium max-w-[400px] mx-auto">
              The {genreName} genre chart is being populated. Check back soon for live data from Apple Music and other platforms.
            </p>
            <a
              href="/genres"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-[13px] font-semibold border border-[var(--border)] text-[var(--text2)] hover:border-[var(--text3)] hover:text-[var(--text)] transition-all no-underline"
            >
              ← Back to all genres
            </a>
          </div>
        )}

        {/* Other genres to explore */}
        {genres.length > 1 && (
          <div className="mt-10">
            <h2 className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] mb-5">
              Explore More Genres
            </h2>
            <div className="flex gap-3 flex-wrap">
              {genres
                .filter((g: Genre) => g.slug !== params.slug)
                .slice(0, 8)
                .map((g: Genre) => (
                  <a
                    key={g.slug}
                    href={`/genres/${g.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold border border-[var(--border)] no-underline transition-all hover:border-[var(--text3)] hover:text-[var(--text2)] text-[var(--text3)]"
                    style={{ borderColor: `${g.color}30` }}
                  >
                    <span className="text-[16px]">{GENRE_EMOJIS[g.slug] || '🎵'}</span>
                    {g.name}
                    <span className="text-[11px] font-bold" style={{ color: g.color }}>{g.songCount}</span>
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
