import type { Metadata } from 'next'
import { getChartEntries } from '@/lib/data'
import { ChartPlatformPageClient } from '../ChartPlatformClient'

export const metadata: Metadata = {
  title: 'YouTube Music Charts',
  description: 'Real-time YouTube Music charts — Global and regional video streaming rankings updated every hour.',
}

export default async function YouTubeChartsPage() {
  const entries = await getChartEntries('youtube', 'global', 50)

  return (
    <ChartPlatformPageClient
      platform="youtube"
      label="YouTube Music"
      color="#ff4444"
      regionName="Global"
      entries={entries}
    />
  )
}
