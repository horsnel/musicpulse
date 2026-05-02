import type { Metadata } from 'next'
import { getChartEntries, getCountryCharts } from '@/lib/data'
import { ChartsPageClient } from './ChartsPageClient'

export const metadata: Metadata = {
  title: 'Charts',
  description:
    'Real-time global music charts — Spotify Daily Top 200, Apple Music Top 100, YouTube Music, Shazam, and Billboard. Updated every hour.',
}

interface SearchParams {
  platform?: string
  region?: string
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const platform = (searchParams.platform as 'spotify' | 'apple' | 'youtube') ?? 'spotify'
  const region   = (searchParams.region as any) ?? 'global'

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
