import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Deezer',
  description: 'Live trending songs on Deezer — discover the most-streamed tracks, chart-topping hits, and rising music right now.',
}

export default async function DeezerTrendingPage() {
  const items = await getTrending('deezer', 25)

  return (
    <TrendingPlatformPageClient
      platform="deezer"
      label="Trending on Deezer"
      sub="Top Charts"
      color="#A238FF"
      items={items}
    />
  )
}
