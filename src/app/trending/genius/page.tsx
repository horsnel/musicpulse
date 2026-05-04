import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { TrendingPlatformPageClient } from '../TrendingPlatformClient'

export const metadata: Metadata = {
  title: 'Trending on Genius',
  description: 'Live trending lyrics and annotations on Genius — discover the most-read lyrics, annotated tracks, and music knowledge right now.',
}

export default async function GeniusTrendingPage() {
  const items = await getTrending('genius', 25)

  return (
    <TrendingPlatformPageClient
      platform="genius"
      label="Trending on Genius"
      sub="Lyrics & Annotations"
      color="#FFFF64"
      items={items}
    />
  )
}
