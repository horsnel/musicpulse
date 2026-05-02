import type { Metadata } from 'next'
import { getChartEntries } from '@/lib/data'
import { ChartPlatformPageClient } from '../ChartPlatformClient'

export const metadata: Metadata = {
  title: 'Apple Music Top 100',
  description: 'Real-time Apple Music Top 100 charts — Global and regional rankings updated every hour.',
}

export default async function AppleChartsPage() {
  const entries = await getChartEntries('apple', 'global', 50)

  return (
    <ChartPlatformPageClient
      platform="apple"
      label="Apple Music Top 100"
      color="#fc3c44"
      regionName="Global"
      entries={entries}
    />
  )
}
