import type { Metadata } from 'next'
import { ArtistSlugResolver } from './ArtistSlugResolver'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const name = slug === '_template' ? 'Artists' : slug.replace(/-/g, ' ')
  return {
    title: `${name} — MusicPulse`,
    description: 'Artist profile, top songs, and streaming stats on MusicPulse.',
  }
}

export function generateStaticParams() {
  // Return a template slug so Cloudflare Pages can serve any dynamic slug
  return [{ slug: '_template' }]
}

export default function ArtistPage() {
  return <ArtistSlugResolver />
}
