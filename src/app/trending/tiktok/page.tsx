import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on TikTok',
  description: 'Live trending sounds and songs on TikTok — discover viral music, trending audio clips, and the most-used sounds right now.',
}

export default async function TikTokTrendingPage() {
  const items = await getTrending('tiktok', 25)

  return (
    <TrendingPlatformPageClient
      platform="tiktok"
      label="Trending on TikTok"
      sub="Trending Sounds"
      color="#ff2d6b"
      items={items}
    />
  )
}
