import type { Metadata } from 'next'
import { getChartEntries } from '@/lib/data'
import { ChartPlatformPageClient } from '../ChartPlatformClient'

export const metadata: Metadata = {
  title: 'Deezer Charts',
  description: 'Real-time Deezer Top Hits charts — Global streaming rankings updated around the clock.',
}

export default async function DeezerChartsPage() {
  const entries = await getChartEntries('deezer', 'global', 50)

  return (
    <ChartPlatformPageClient
      platform="deezer"
      label="Deezer Top Hits"
      color="#A238FF"
      regionName="Global"
      entries={entries}
    />
  )
}
