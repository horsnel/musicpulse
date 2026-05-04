import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Audiomack',
  description: 'Live trending streams on Audiomack — discover the most-streamed hip-hop, Afrobeats, and independent music right now.',
}

export default async function AudiomackTrendingPage() {
  const items = await getTrending('audiomack', 25)

  return (
    <TrendingPlatformPageClient
      platform="audiomack"
      label="Trending on Audiomack"
      sub="Trending Streams"
      color="#FFA200"
      items={items}
    />
  )
}
