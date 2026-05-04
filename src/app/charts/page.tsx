import type { Metadata } from 'next'
import { getChartEntries, getCountryCharts } from '@/lib/data'
import { ChartsPageClient } from './ChartsPageClient'

export const metadata: Metadata = {
  title: 'Charts',
  description: 'Real-time global music charts — Spotify Daily Top 200, Apple Music Top 100, YouTube Music, Shazam, and Billboard. Updated every hour.',
}

export default async function ChartsPage() {
  const platform = 'spotify' as const
  const region = 'global' as const

  const [entries, countryCharts] = await Promise.all([
    getChartEntries(platform, region, 50),
    getCountryCharts(),
  ])

  return (
    <ChartsPageClient
      initialEntries={entries}
      countryCharts={countryCharts}
      initialPlatform={platform}
      initialRegion={region}
    />
  )
}
