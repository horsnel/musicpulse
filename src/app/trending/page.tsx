import type { Metadata } from 'next'
import {
  getTrending, getCrossPlatformScores,
  getVelocityItems, getGenreHeatmap,
} from '@/lib/data'
import { TrendingPageClient } from './TrendingPageClient'

export const metadata: Metadata = {
  title: 'Trending Now',
  description:
    'Live trending music data from TikTok, Twitter/X, YouTube, Spotify, Apple Music, Deezer, SoundCloud and Billboard — updated every 2 hours. Discover viral songs, trending hashtags, and rising artists.',
}

export default async function TrendingPage() {
  const [tiktok, twitter, youtube, spotify, apple, deezer, soundcloud, billboard, crossPlatform, velocity, heatmap] =
    await Promise.all([
      getTrending('tiktok', 8),
      getTrending('twitter', 8),
      getTrending('youtube', 8),
      getTrending('spotify', 5),
      getTrending('apple', 6),
      getTrending('deezer', 5),
      getTrending('soundcloud', 5),
      getTrending('billboard', 5),
      getCrossPlatformScores(5),
      getVelocityItems(5),
      getGenreHeatmap(),
    ])

  return (
    <TrendingPageClient
      tiktok={tiktok}
      twitter={twitter}
      youtube={youtube}
      spotify={spotify}
      apple={apple}
      deezer={deezer}
      soundcloud={soundcloud}
      billboard={billboard}
      crossPlatform={crossPlatform}
      velocity={velocity}
      heatmap={heatmap}
    />
  )
}
