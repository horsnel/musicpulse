import type { Metadata } from 'next'
import { ArtistDetailClient } from './ArtistDetailClient'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug.replace(/-/g, ' ')} — MusicPulse`,
    description: 'Artist profile, top songs, and streaming stats on MusicPulse.',
  }
}

export default function ArtistPage({ params }: Props) {
  return <ArtistDetailClient slug={params.slug} />
}

export function generateStaticParams() {
  return [
    { slug: 'burna-boy' },
    { slug: 'kendrick-lamar' },
    { slug: 'billie-eilish' },
    { slug: 'rose' },
    { slug: 'sabrina-carpenter' },
    { slug: 'davido' },
  ]
}
