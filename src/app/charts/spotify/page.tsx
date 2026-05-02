import type { Metadata } from 'next'
import { getChartEntries } from '@/lib/data'
import { ChartPlatformPageClient } from '../ChartPlatformClient'

export const metadata: Metadata = {
  title: 'Spotify Charts',
  description: 'Real-time Spotify Daily Top 200 charts — Global and regional streaming rankings updated every hour.',
}

export default async function SpotifyChartsPage() {
  const entries = await getChartEntries('spotify', 'global', 50)

  return (
    <ChartPlatformPageClient
      platform="spotify"
      label="Spotify Daily Top 200"
      color="#1DB954"
      regionName="Global"
      entries={entries}
    />
  )
}
