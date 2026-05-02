import type { Metadata } from 'next'
import {
  getTrending, getCrossPlatformScores,
  getVelocityItems, getGenreHeatmap,
} from '@/lib/data'
import { TrendingPageClient } from './TrendingPageClient'

export const metadata: Metadata = {
  title: 'Trending Now',
  description:
    'Live trending music data from TikTok, Twitter/X, YouTube and Spotify — updated every 2 hours. Discover viral songs, trending hashtags, and rising artists.',
}

export default async function TrendingPage() {
  const [tiktok, twitter, youtube, spotify, crossPlatform, velocity, heatmap] =
    await Promise.all([
      getTrending('tiktok', 8),
      getTrending('twitter', 8),
      getTrending('youtube', 8),
      getTrending('spotify', 5),
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
      crossPlatform={crossPlatform}
      velocity={velocity}
      heatmap={heatmap}
    />
  )
}
