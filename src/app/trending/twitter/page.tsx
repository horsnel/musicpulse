import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on X',
  description: 'Live trending music topics on X (Twitter) — discover what the world is talking about in music right now.',
}

export default async function TwitterTrendingPage() {
  const items = await getTrending('twitter', 25)

  return (
    <TrendingPlatformPageClient
      platform="twitter"
      label="Trending on X"
      sub="Music Topics"
      color="#e0e0e0"
      items={items}
    />
  )
}
