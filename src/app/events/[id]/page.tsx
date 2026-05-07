import type { Metadata } from 'next'
import { EventDetailClient } from './EventDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Event Details — MusicPulse',
    description: 'Concert, festival, and tour details on MusicPulse.',
  }
}

export function generateStaticParams() {
  return [{ id: '_template' }]
}

export default function EventDetailPage({ params }: Props) {
  // We need to read the slug from the URL client-side since this is static export
  return <EventSlugResolver />
}

import { EventSlugResolver } from './EventSlugResolver'
