import type { Metadata } from 'next'
import { getChartEntries, getNewReleases, getTrending, getTopArtists, getArticles, getEvents } from '@/lib/data'
import { SectionHeader } from '@/components/ui'
import { HeroSection } from '@/components/layout/HeroSection'
import { ChartsGrid } from '@/components/charts/ChartsGrid'
import { TrendingRow } from '@/components/trending/TrendingRow'
import { ReleasesGrid } from '@/components/song/ReleasesGrid'
import { ArtistsRow } from '@/components/artist/ArtistsRow'
import { GenrePills } from '@/components/ui/GenrePills'
import { Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Article, ConcertEvent } from '@/types'

export const metadata: Metadata = {
  title: 'MusicPulse — Global Music Charts & Trends',
  description:
    'Real-time global music charts from Spotify, Apple Music, YouTube and more. Track trending songs, new releases, and top artists.',
}

export default async function HomePage() {
  const [spotifyChart, appleChart, tiktokTrending, twitterTrending, youtubeTrending, newReleases, topArtists, articles, events] =
    await Promise.all([
      getChartEntries('spotify', 'global', 7),
      getChartEntries('apple', 'global', 7),
      getTrending('tiktok', 3),
      getTrending('twitter', 3),
      getTrending('youtube', 3),
      getNewReleases(5),
      getTopArtists(6),
      getArticles(3),
      getEvents(3),
    ])

  return (
    <div className="relative z-10">
      {/* Hero */}
      <HeroSection spotifyTop5={spotifyChart.slice(0, 5)} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7">
        {/* Charts */}
        {spotifyChart.length > 0 || appleChart.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Charts"
              icon={<ChartsIcon />}
              iconBg="var(--green-dim)"
              action={{ label: 'All charts', href: '/charts' }}
            />
            <ChartsGrid spotifyEntries={spotifyChart} appleEntries={appleChart} />
          </section>
        ) : (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Charts"
              icon={<ChartsIcon />}
              iconBg="var(--green-dim)"
              action={{ label: 'All charts', href: '/charts' }}
            />
            <div className="text-center py-12 text-[var(--text3)]">
              <p className="text-[14px] font-medium">Loading charts data...</p>
              <p className="text-[12px] mt-1">Data refreshes every 6 hours from live sources.</p>
            </div>
          </section>
        )}

        {/* Trending */}
        {tiktokTrending.length > 0 || twitterTrending.length > 0 || youtubeTrending.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Trending on Social"
              icon={<TrendingIcon />}
              iconBg="rgba(255,45,107,0.1)"
              action={{ label: 'All trending', href: '/trending' }}
            />
            <TrendingRow
              tiktok={tiktokTrending}
              twitter={twitterTrending}
              youtube={youtubeTrending}
            />
          </section>
        ) : (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Trending on Social"
              icon={<TrendingIcon />}
              iconBg="rgba(255,45,107,0.1)"
              action={{ label: 'All trending', href: '/trending' }}
            />
            <div className="text-center py-12 text-[var(--text3)]">
              <p className="text-[14px] font-medium">Loading trending data...</p>
              <p className="text-[12px] mt-1">Trending data refreshes every 2 hours.</p>
            </div>
          </section>
        )}

        {/* New Releases */}
        {newReleases.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="New Releases"
              icon={<ReleasesIcon />}
              iconBg="var(--blue-dim)"
              action={{ label: 'All releases', href: '/new-releases' }}
            />
            <ReleasesGrid albums={newReleases} />
          </section>
        ) : null}

        {/* Genres */}
        <section className="py-10 sm:py-20">
          <SectionHeader title="Browse by Genre" icon={<GenreIcon />} iconBg="var(--gold-dim)" />
          <GenrePills />
        </section>

        {/* Top Artists */}
        {topArtists.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Top Artists"
              icon={<ArtistIcon />}
              iconBg="var(--purple-dim)"
              action={{ label: 'All artists', href: '/artists' }}
            />
            <ArtistsRow artists={topArtists} />
          </section>
        ) : null}

        {/* Articles */}
        {articles.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Latest Articles"
              icon={<ArticleIcon />}
              iconBg="var(--purple-dim)"
              action={{ label: 'All articles', href: '/blog' }}
            />
            <div className="grid md:grid-cols-3 gap-5">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Upcoming Events */}
        {events.length > 0 ? (
          <section className="py-10 sm:py-20">
            <SectionHeader
              title="Upcoming Events"
              icon={<EventIcon />}
              iconBg="var(--gold-dim)"
              action={{ label: 'All events', href: '/events' }}
            />
            <div className="grid md:grid-cols-3 gap-5">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

// Icons
function ChartsIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="1,14 5,8 9,11 13,5 17,2" stroke="#1DB954" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> }
function TrendingIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 14c2-4 4-5 6-3 2 2 3 1 5-4" stroke="#ff2d6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M11 6l3 0 0 3" stroke="#ff2d6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> }
function ReleasesIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#4361ff" strokeWidth="1.5" fill="none"/><circle cx="9" cy="9" r="2" fill="#4361ff"/><line x1="9" y1="1.5" x2="9" y2="4" stroke="#4361ff" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function GenreIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="2" stroke="#ffb830" strokeWidth="1.5" fill="none"/><rect x="10" y="1" width="7" height="7" rx="2" stroke="#ffb830" strokeWidth="1.5" fill="none"/><rect x="1" y="10" width="7" height="7" rx="2" stroke="#ffb830" strokeWidth="1.5" fill="none"/><rect x="10" y="10" width="7" height="7" rx="2" stroke="#ffb830" strokeWidth="1.5" fill="none"/></svg> }
function ArtistIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="#b06cff" strokeWidth="1.5" fill="none"/><path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#b06cff" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg> }
function ArticleIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="#b06cff" strokeWidth="1.5" fill="none"/><line x1="5" y1="6" x2="13" y2="6" stroke="#b06cff" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="9" x2="11" y2="9" stroke="#b06cff" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="12" x2="9" y2="12" stroke="#b06cff" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function EventIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke="#ffb830" strokeWidth="1.5" fill="none"/><line x1="6" y1="1" x2="6" y2="5" stroke="#ffb830" strokeWidth="1.3" strokeLinecap="round"/><line x1="12" y1="1" x2="12" y2="5" stroke="#ffb830" strokeWidth="1.3" strokeLinecap="round"/><line x1="2" y1="8" x2="16" y2="8" stroke="#ffb830" strokeWidth="1.2"/></svg> }

// Category badge styles
const CATEGORY_STYLES: Record<string, { variant: 'blue' | 'gold' | 'purple' | 'green' | 'pink' }> = {
  news:           { variant: 'blue' },
  review:         { variant: 'gold' },
  feature:        { variant: 'purple' },
  'chart-analysis': { variant: 'green' },
  interview:      { variant: 'pink' },
}

// Article card component
function ArticleCard({ article }: { article: Article }) {
  const catStyle = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.news
  return (
    <a
      href={article.sourceUrl || `/blog/${article.slug}`}
      className="block no-underline"
      target={article.sourceUrl ? '_blank' : undefined}
      rel={article.sourceUrl ? 'noopener noreferrer' : undefined}
    >
      <div className="mp-card group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex gap-0 h-full">
        {/* Image */}
        <div
          className="w-[100px] sm:w-[120px] flex-shrink-0 bg-cover bg-center"
          style={article.imageUrl ? { backgroundImage: `url(${article.imageUrl})` } : {
            background: 'linear-gradient(135deg, #642b73, #c6426e)',
          }}
        />
        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3 sm:p-4 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={catStyle.variant} className="text-[9px] px-2 py-0.5">
              {article.category.replace('-', ' ')}
            </Badge>
          </div>
          <h3 className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] line-clamp-2 group-hover:text-[var(--green)] transition-colors">
            {article.title}
          </h3>
          <div className="text-[10px] sm:text-[11px] text-[var(--text3)] font-medium mt-auto">
            {article.author} · {formatDate(article.publishedAt)}
          </div>
        </div>
      </div>
    </a>
  )
}

// Event card component
function EventCard({ event }: { event: ConcertEvent }) {
  const statusVariant = event.status === 'upcoming' ? 'green' as const
    : event.status === 'ongoing' ? 'gold' as const
    : 'pink' as const

  return (
    <a
      href={`/events/${event.slug || event.id}`}
      className="block no-underline"
    >
      <div className="mp-card group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg h-full flex flex-col">
        {/* Image */}
        <div
          className="h-[120px] bg-cover bg-center relative"
          style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : {
            background: 'linear-gradient(135deg, #642b73, #c6426e)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg2)] via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3">
            <Badge variant={statusVariant}>
              {event.status === 'sold-out' ? 'Sold Out' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </div>
        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
            {event.artist}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[var(--text3)] font-medium mt-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1C3.3 1 2 2.3 2 4c0 2.5 3 5 3 5s3-2.5 3-5c0-1.7-1.3-3-3-3z" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </svg>
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-[var(--text3)] font-medium mt-1">
            {formatDate(event.date)}
          </div>
        </div>
      </div>
    </a>
  )
}
