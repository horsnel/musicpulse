'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { ConcertEvent } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

interface Props {
  events: ConcertEvent[]
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

export function EventsPageClient({ events }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [nearbyEvents, setNearbyEvents] = useState<ConcertEvent[]>([])
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'found' | 'denied' | 'error'>('idle')
  const [userCity, setUserCity] = useState('')

  const filters = ['all', 'upcoming', 'ongoing', 'sold-out']

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.status === activeFilter)

  // Fetch nearby events when location is available
  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://musicpulse-api.odehebuka48.workers.dev'
      // Use 500km radius for more realistic nearby results
      const res = await fetch(`${API_URL}/api/events/near?lat=${lat}&lng=${lng}&radius=500&limit=6`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setNearbyEvents(json.data)
        }
        setLocationStatus('found')
      }
    } catch {
      // Silently fail - nearby is an enhancement, not critical
    }
  }, [])

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await fetchNearby(latitude, longitude)

        // Try reverse geocoding for city name
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          if (res.ok) {
            const data = await res.json()
            setUserCity(data.city || data.locality || 'your area')
          }
        } catch {
          setUserCity('your area')
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied')
        } else {
          setLocationStatus('error')
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }, [fetchNearby])

  // Auto-request location on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      // Check if permission is already granted
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestLocation()
        }
      }).catch(() => {
        // permissions API not supported, don't auto-request
      })
    }
  }, [requestLocation])

  return (
    <div className="relative z-10">
      {/* Page header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,184,48,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,184,48,0.25)', color: 'var(--gold)' }}>
            Live Events
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Concerts & Events
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Upcoming and ongoing concerts, festivals, and tours
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-8" />

        {/* Events Near You Section */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] sm:text-[24px] font-black tracking-[-0.03em] flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C7.2 2 5 4.2 5 7c0 4.2 5 9 5 9s5-4.8 5-9c0-2.8-2.2-5-5-5z" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="7" r="2" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
              </svg>
              {locationStatus === 'found' && userCity ? `Events Near ${userCity}` : 'Events Near You'}
            </h2>
            {locationStatus === 'idle' && (
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold no-underline transition-all border-none cursor-pointer"
                style={{ background: 'var(--gold)', color: '#000' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="#000" strokeWidth="1.2" fill="none" />
                  <circle cx="6" cy="6" r="1" fill="#000" />
                </svg>
                Enable Location
              </button>
            )}
            {locationStatus === 'loading' && (
              <span className="text-[12px] text-[var(--text3)] font-medium flex items-center gap-1.5">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="var(--text3)" strokeWidth="1.5" fill="none" strokeDasharray="20 12" />
                </svg>
                Finding your location...
              </span>
            )}
            {locationStatus === 'denied' && (
              <span className="text-[11px] text-[var(--text3)] font-medium px-3 py-1.5 rounded-full" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                Location access denied
              </span>
            )}
          </div>

          {nearbyEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {nearbyEvents.map(event => (
                <EventCard key={event.id} event={event} showDistance />
              ))}
            </div>
          ) : locationStatus === 'found' ? (
            <div className="mp-card p-6 text-center text-[var(--text3)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2">
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 11 7 11s7-5.7 7-11c0-3.9-3.1-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <p className="text-[13px] font-medium">No events found within 500 km of your location.</p>
              <p className="text-[11px] mt-1">Check out all events below, or broaden your search area.</p>
            </div>
          ) : locationStatus === 'idle' || locationStatus === 'loading' ? (
            <div className="mp-card p-6 text-center text-[var(--text3)]">
              <p className="text-[13px] font-medium">Enable your location to discover events near you.</p>
            </div>
          ) : null}
        </section>

        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-8" />

        {/* All Events Section */}
        <h2 className="text-[20px] sm:text-[24px] font-black tracking-[-0.03em] mb-5">All Events</h2>

        {/* Filter tabs */}
        <div className="flex gap-0.5 bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-[3px] w-fit mb-6 sm:mb-8">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-4 py-2 rounded-[9px] text-[13px] font-semibold tracking-[-0.01em] transition-all border-none cursor-pointer capitalize',
                activeFilter === f
                  ? 'bg-[var(--bg3)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text3)] hover:text-[var(--text2)] bg-transparent',
              )}
            >
              {f === 'sold-out' ? 'Sold Out' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--text3)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="4" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1.2" />
              <line x1="10" y1="3" x2="10" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="22" y1="3" x2="22" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] font-medium">{activeFilter === 'all' ? 'Loading events...' : `No ${activeFilter.replace('-', ' ')} events found`}</p>
            <p className="text-[12px] mt-1">Events data refreshes from live sources.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Event Card Component ──────────────────────────────────────────

function EventCard({ event, showDistance }: { event: ConcertEvent; showDistance?: boolean }) {
  const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming
  const typeStyle = TYPE_STYLES[event.type] ?? TYPE_STYLES.concert

  return (
    <Link href={`/events/${event.slug || event.id}`} className="block no-underline">
    <div className="mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col overflow-hidden">
      {/* Hero image */}
      <div
        className="h-[180px] bg-cover bg-center relative"
        style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : {
          background: 'linear-gradient(135deg, #642b73, #c6426e)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg2)] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 flex-wrap">
          <Badge variant={typeStyle.variant}>{typeStyle.label}</Badge>
          <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
          {showDistance && event.distanceKm !== undefined && (
            <Badge variant="gold">{event.distanceKm} km</Badge>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-[15px] sm:text-[16px] font-bold tracking-[-0.02em] mb-1 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
          {event.title}
        </h3>
        <Link
          href={`/artists/${event.artistSlug}`}
          className="text-[13px] font-semibold text-[var(--green)] hover:underline no-underline mb-2.5"
        >
          {event.artist}
        </Link>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text3)] font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C3.8 1 2 2.8 2 5c0 3 4 6 4 6s4-3 4-6c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="6" cy="5" r="1.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </svg>
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--text3)] font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
              <line x1="4" y1="1" x2="4" y2="3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="8" y1="1" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
        </div>

        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold no-underline transition-all"
            style={{ background: 'var(--gold)', color: '#000' }}
            onClick={(e) => e.stopPropagation()}
          >
            Get Tickets
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <polyline points="5,2 8,5 5,8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </a>
        )}
      </div>
    </div>
    </Link>
  )
}
