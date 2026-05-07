'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ConcertEvent } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

const API_URL = 'https://musicpulse-api.odehebuka48.workers.dev'

interface Props {
  eventId: string
}

const STATUS_STYLES: Record<string, { variant: 'green' | 'gold' | 'pink'; label: string }> = {
  upcoming:  { variant: 'green', label: 'Upcoming' },
  ongoing:   { variant: 'gold',  label: 'Ongoing' },
  'sold-out': { variant: 'pink', label: 'Sold Out' },
}

const TYPE_STYLES: Record<string, { variant: 'blue' | 'purple' | 'green' | 'pink'; label: string }> = {
  concert: { variant: 'blue',   label: 'Concert' },
  festival: { variant: 'purple', label: 'Festival' },
  tour:    { variant: 'green',  label: 'Tour' },
  virtual: { variant: 'pink',   label: 'Virtual' },
}

export function EventDetailClient({ eventId }: Props) {
  const [event, setEvent] = useState<ConcertEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_URL}/api/events?limit=50`, {
          headers: { 'Accept': 'application/json' },
        })
        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }
        const json = await res.json()
        const events: ConcertEvent[] = json.data || []
        const found = events.find((e) => e.id === eventId || e.slug === eventId)
        if (found) {
          setEvent(found)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="relative z-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-16">
          <div className="animate-pulse">
            <div className="h-[300px] rounded-xl bg-[var(--bg3)] mb-8" />
            <div className="h-8 w-3/4 rounded bg-[var(--bg3)] mb-4" />
            <div className="h-6 w-1/2 rounded bg-[var(--bg3)] mb-6" />
            <div className="h-4 w-full rounded bg-[var(--bg3)] mb-3" />
            <div className="h-4 w-2/3 rounded bg-[var(--bg3)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="mp-card p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(255,45,107,0.1)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="#ff2d6b" strokeWidth="1.5" fill="none" />
              <path d="M10 18V13M14 18V10M18 18V15" stroke="#ff2d6b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Event Not Found</h2>
          <p className="text-[14px] text-[var(--text3)] mb-6">
            We couldn&apos;t find this event. It may have been removed or the link may be incorrect.
          </p>
          <Link href="/events" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--gold)', color: '#000' }}>
            All Events
          </Link>
        </div>
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming
  const typeStyle = TYPE_STYLES[event.type] ?? TYPE_STYLES.concert

  return (
    <div className="relative z-10">
      <div className="relative overflow-hidden">
        <div
          className="h-[300px] sm:h-[400px] bg-cover bg-center"
          style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : {
            background: 'linear-gradient(135deg, #642b73, #c6426e)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-7 -mt-24 relative z-10 pb-16 sm:pb-24">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text3)] hover:text-[var(--gold)] transition-colors mb-6 group"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Events
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant={typeStyle.variant}>{typeStyle.label}</Badge>
          <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
        </div>

        <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-[-0.04em] leading-[1.1] mb-3">
          {event.title}
        </h1>

        <Link
          href={`/artists/${event.artistSlug}`}
          className="text-[16px] font-semibold text-[var(--green)] hover:underline no-underline mb-6 inline-block"
        >
          {event.artist}
        </Link>

        <div className="mp-card mt-6">
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,48,0.1)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2C6.2 2 4 4.2 4 7c0 4.2 5 9 5 9s5-4.8 5-9c0-2.8-2.2-5-5-5z" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
                  <circle cx="9" cy="7" r="2" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text3)]">Venue</div>
                <div className="text-[14px] font-bold text-[var(--text)]">{event.venue}</div>
                <div className="text-[12px] text-[var(--text3)]">{event.city}, {event.country}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,185,84,0.1)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="13" rx="2" stroke="var(--green)" strokeWidth="1.3" fill="none" />
                  <line x1="5" y1="1" x2="5" y2="5" stroke="var(--green)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="13" y2="5" stroke="var(--green)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text3)]">Date</div>
                <div className="text-[14px] font-bold text-[var(--text)]">{formatDate(event.date)}</div>
                {event.endDate && (
                  <div className="text-[12px] text-[var(--text3)]">until {formatDate(event.endDate)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mp-card mt-5 p-5 sm:p-6">
          <h3 className="text-[14px] font-bold tracking-[-0.02em] mb-3">About This Event</h3>
          <p className="text-[14px] text-[var(--text2)] leading-[1.75]">{event.description}</p>
        </div>

        {event.ticketUrl && (
          <div className="mt-6">
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold no-underline transition-all hover:brightness-110"
              style={{ background: 'var(--gold)', color: '#000' }}
            >
              Get Tickets
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="1" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <polyline points="6,3 9,6 6,9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
