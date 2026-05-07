'use client'

import { useEffect, useState } from 'react'
import { EventDetailClient } from './EventDetailClient'

/**
 * For static export, we need to extract the event ID from the URL
 * on the client side since generateStaticParams can't pre-generate
 * all possible event IDs.
 */
export function EventSlugResolver() {
  const [eventId, setEventId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2 && pathParts[0] === 'events') {
      setEventId(pathParts.slice(1).join('/'))
    } else {
      setEventId('')
    }
  }, [])

  if (!mounted || eventId === null) {
    return (
      <div className="relative z-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-16">
          <div className="animate-pulse">
            <div className="h-[300px] rounded-xl bg-[var(--bg3)] mb-8" />
            <div className="h-8 w-3/4 rounded bg-[var(--bg3)] mb-4" />
            <div className="h-6 w-1/2 rounded bg-[var(--bg3)] mb-6" />
          </div>
        </div>
      </div>
    )
  }

  if (eventId === '') {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="mp-card p-10 text-center max-w-md">
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Events</h2>
          <p className="text-[14px] text-[var(--text3)] mb-6">Browse events on MusicPulse.</p>
          <a href="/events" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--gold)', color: '#000' }}>
            All Events
          </a>
        </div>
      </div>
    )
  }

  return <EventDetailClient eventId={eventId} />
}
