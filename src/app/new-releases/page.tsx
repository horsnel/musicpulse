import type { Metadata } from 'next'
import { getNewReleases } from '@/lib/data'
import { ReleasesGrid } from '@/components/song/ReleasesGrid'
import { NewReleasesPageClient } from './NewReleasesPageClient'

export const metadata: Metadata = {
  title: 'New Releases',
  description: 'Discover the latest album and single releases across all genres — updated daily from Spotify, Apple Music, and more.',
}

export default async function NewReleasesPage() {
  const releases = await getNewReleases(30)

  return <NewReleasesPageClient releases={releases} />
}
