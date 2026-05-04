import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on YouTube Music',
  description: 'Live trending music videos on YouTube — discover the most-watched music content, viral hits, and rising stars right now.',
}

export default async function YouTubeTrendingPage() {
  const items = await getTrending('youtube', 25)

  return (
    <TrendingPlatformPageClient
      platform="youtube"
      label="Trending on YouTube Music"
      sub="Top Music Videos"
      color="#ff3333"
      items={items}
    />
  )
}
