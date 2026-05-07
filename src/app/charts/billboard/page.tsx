import type { Metadata } from 'next'
import { getTrending } from '@/lib/data'
import { BillboardPageClient } from './BillboardPageClient'

export const metadata: Metadata = {
  title: 'Billboard Hot 100',
  description: 'Real-time Billboard Hot 100 charts — the definitive US music rankings updated weekly.',
}

export default async function BillboardChartsPage() {
  // Billboard chart data in KV is often empty because the scraper uses Apple Music fallback.
  // Trending data for billboard is more reliable, so use that.
  const entries = await getTrending('billboard', 50)

  return <BillboardPageClient entries={entries} />
}
