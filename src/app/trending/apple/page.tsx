import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Apple Music',
  description: 'Live trending songs on Apple Music — discover the most-played tracks, chart climbers, and hottest hits right now.',
}

export default async function AppleTrendingPage() {
  const items = await getTrending('apple', 25)

  return (
    <TrendingPlatformPageClient
      platform="apple"
      label="Trending on Apple Music"
      sub="Top Plays"
      color="#fc3c44"
      items={items}
    />
  )
}
