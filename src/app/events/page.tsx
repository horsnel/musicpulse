import type { Metadata } from 'next'
import { getEvents } from '@/lib/data'
import { EventsPageClient } from './EventsPageClient'

export const metadata: Metadata = {
  title: 'Concerts & Events',
  description: 'Upcoming and ongoing concerts, festivals, and tours from top artists worldwide.',
}

export default async function EventsPage() {
  const events = await getEvents(20)

  return <EventsPageClient events={events} />
}
