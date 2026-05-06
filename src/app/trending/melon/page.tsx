import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Melon',
  description: 'Live Korea Top 100 on Melon — discover the hottest K-Pop, Korean hip-hop, and trending tracks right now.',
}

export default async function MelonTrendingPage() {
  const items = await getTrending('melon', 25)

  return (
    <TrendingPlatformPageClient
      platform="melon"
      label="Trending on Melon"
      sub="Korea Top 100"
      color="#00CD3C"
      items={items}
    />
  )
}
