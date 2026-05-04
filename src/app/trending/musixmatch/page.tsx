import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Musixmatch',
  description: 'Live trending lyrics on Musixmatch — discover the most-searched lyrics, translated tracks, and global music trends right now.',
}

export default async function MusixmatchTrendingPage() {
  const items = await getTrending('musixmatch', 25)

  return (
    <TrendingPlatformPageClient
      platform="musixmatch"
      label="Trending on Musixmatch"
      sub="Lyrics Trends"
      color="#FF6E40"
      items={items}
    />
  )
}
