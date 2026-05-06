import type { Metadata } from 'next'
import { getAggregatedCharts } from '@/lib/data'
import { GlobalChartsClient } from './GlobalChartsClient'

export const metadata: Metadata = {
  title: 'Global Charts — Aggregated',
  description: 'The most accurate global music rankings — accumulated from Spotify, Apple Music, YouTube, TikTok, and more.',
}

export default async function GlobalChartsPage() {
  const entries = await getAggregatedCharts(200)

  return <GlobalChartsClient entries={entries} />
}
