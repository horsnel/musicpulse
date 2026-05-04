import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Billboard',
  description: 'Live trending songs on the Billboard Hot 100 — discover the biggest chart movers, new entries, and hottest hits right now.',
}

export default async function BillboardTrendingPage() {
  const items = await getTrending('billboard', 25)

  return (
    <TrendingPlatformPageClient
      platform="billboard"
      label="Trending on Billboard"
      sub="Hot 100"
      color="#E60026"
      items={items}
    />
  )
}
