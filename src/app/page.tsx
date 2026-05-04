import type { Metadata } from 'next'
import { getChartEntries, getNewReleases, getTrending, getTopArtists } from '@/lib/data'
import { SectionHeader } from '@/components/ui'
import { HeroSection } from '@/components/layout/HeroSection'
import { ChartsGrid } from '@/components/charts/ChartsGrid'
import { TrendingRow } from '@/components/trending/TrendingRow'
import { ReleasesGrid } from '@/components/song/ReleasesGrid'
import { ArtistsRow } from '@/components/artist/ArtistsRow'
import { GenrePills } from '@/components/ui/GenrePills'

export const metadata: Metadata = {
  title: 'MusicPulse — Global Music Charts & Trends',
  description:
    'Real-time global music charts from Spotify, Apple Music, YouTube and more. Track trending songs, new releases, and top artists.',
}

export default async function HomePage() {
  const [spotifyChart, appleChart, tiktokTrending, twitterTrending, youtubeTrending, newReleases, topArtists] =
    await Promise.all([
      getChartEntries('spotify', 'global', 7),
      getChartEntries('apple', 'global', 7),
      getTrending('tiktok', 3),
      getTrending('twitter', 3),
      getTrending('youtube', 3),
      getNewReleases(5),
      getTopArtists(6),
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
