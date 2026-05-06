import type { Metadata } from 'next'
import { SongDetailClient } from './SongDetailClient'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug.replace(/-/g, ' ')} — MusicPulse`,
    description: 'Song details, chart performance, and streaming stats on MusicPulse.',
  }
}

export default function SongPage({ params }: Props) {
  return <SongDetailClient slug={params.slug} />
}

// Generate some static paths for SEO, but the client component handles any slug
export function generateStaticParams() {
  return [
    { slug: 'apt-rose-bruno-mars' },
    { slug: 'die-with-a-smile' },
    { slug: 'birds-of-a-feather' },
    { slug: 'espresso' },
    { slug: 'not-like-us' },
  ]
}
