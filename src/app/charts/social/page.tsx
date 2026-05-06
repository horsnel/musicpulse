import type { Metadata } from 'next'
import { getSocialCharts } from '@/lib/data'
import { SocialChartsClient } from './SocialChartsClient'

export const metadata: Metadata = {
  title: 'Social Media Charts',
  description: 'Accumulated social media engagement across TikTok, X, YouTube, and more — the ultimate social music ranking.',
}

export default async function SocialChartsPage() {
  const entries = await getSocialCharts(200)

  return <SocialChartsClient entries={entries} />
}
