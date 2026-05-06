import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Oricon',
  description: 'Live Japan Hot 100 on Oricon — discover the top J-Pop, anime hits, and trending tracks in Japan right now.',
}

export default async function OriconTrendingPage() {
  const items = await getTrending('oricon', 25)

  return (
    <TrendingPlatformPageClient
      platform="oricon"
      label="Trending on Oricon"
      sub="Japan Hot 100"
      color="#CC0000"
      items={items}
    />
  )
}
