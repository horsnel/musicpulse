import type { Metadata } from 'next'
import { getCrossPlatformScores } from '@/lib/data'
import { CrossPlatformPageClient } from './CrossPlatformPageClient'

export const metadata: Metadata = {
  title: 'Cross-Platform Power Score',
  description: 'Songs dominating across TikTok, X, YouTube, and Spotify — ranked by their combined cross-platform power score.',
}

export default async function CrossPlatformPage() {
  const crossPlatform = await getCrossPlatformScores(25)

  return <CrossPlatformPageClient crossPlatform={crossPlatform} />
}
