import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Spotify',
  description: 'Live trending songs on Spotify — discover the most-streamed tracks, rising hits, and what the world is listening to right now.',
}

export default async function SpotifyTrendingPage() {
  const items = await getTrending('spotify', 25)

  return (
    <TrendingPlatformPageClient
      platform="spotify"
      label="Trending on Spotify"
      sub="Top Streaming"
      color="#1DB954"
      items={items}
    />
  )
}
