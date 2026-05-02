import type { Metadata } from 'next'
import { getChartEntries } from '@/lib/data'
import { ChartPlatformPageClient } from '../ChartPlatformClient'

export const metadata: Metadata = {
  title: 'Billboard Hot 100',
  description: 'Real-time Billboard Hot 100 charts — the definitive US music rankings updated weekly.',
}

export default async function BillboardChartsPage() {
  const entries = await getChartEntries('billboard', 'us', 50)

  return (
    <ChartPlatformPageClient
      platform="billboard"
      label="Billboard Hot 100"
      color="#e60026"
      regionName="United States"
      entries={entries}
    />
  )
}
