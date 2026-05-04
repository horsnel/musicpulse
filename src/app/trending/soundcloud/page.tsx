import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on SoundCloud',
  description: 'Live trending tracks on SoundCloud — discover the hottest independent music, viral tracks, and emerging artists right now.',
}

export default async function SoundCloudTrendingPage() {
  const items = await getTrending('soundcloud', 25)

  return (
    <TrendingPlatformPageClient
      platform="soundcloud"
      label="Trending on SoundCloud"
      sub="Trending Tracks"
      color="#FF5500"
      items={items}
    />
  )
}
