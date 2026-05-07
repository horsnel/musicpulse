import type { Metadata } from 'next'
import { SongSlugResolver } from './SongSlugResolver'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const name = slug === '_template' ? 'Songs' : slug.replace(/-/g, ' ')
  return {
    title: `${name} — MusicPulse`,
    description: 'Song details, chart performance, and streaming stats on MusicPulse.',
  }
}

export function generateStaticParams() {
  return [{ slug: '_template' }]
}

export default function SongPage() {
  return <SongSlugResolver />
}
