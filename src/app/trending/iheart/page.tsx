import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on iHeartRadio',
  description: 'Live trending songs on iHeartRadio — discover the most-played radio hits, station favorites, and chart-topping tracks right now.',
}

export default async function IHeartTrendingPage() {
  const items = await getTrending('iheart', 25)

  return (
    <TrendingPlatformPageClient
      platform="iheart"
      label="Trending on iHeartRadio"
      sub="Radio Charts"
      color="#C6002B"
      items={items}
    />
  )
}
