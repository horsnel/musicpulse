import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Bandcamp',
  description: 'Live best-selling tracks on Bandcamp — discover top independent music, fan-funded hits, and rising artists right now.',
}

export default async function BandcampTrendingPage() {
  const items = await getTrending('bandcamp', 25)

  return (
    <TrendingPlatformPageClient
      platform="bandcamp"
      label="Trending on Bandcamp"
      sub="Best Selling"
      color="#629AA9"
      items={items}
    />
  )
}
