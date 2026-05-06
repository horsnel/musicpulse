'use client'

import { useState } from 'react'
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

  const filters = ['all', 'upcoming', 'ongoing', 'sold-out']

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.status === activeFilter)

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
            {filtered.map(event => {
              const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming
              const typeStyle = TYPE_STYLES[event.type] ?? TYPE_STYLES.concert
              return (
                <div key={event.id} className="mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col overflow-hidden">
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
