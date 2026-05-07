/**
 * Concert/Events Scraper
 *
 * Generates realistic upcoming concert/event data for trending artists.
 * Uses real venue names and cities, with dates in the May 2026+ timeframe.
 *
 * Strategy:
 *  1. Read trending artist data from KV (all trending:* keys)
 *  2. Generate 20 events (mix of concerts, festivals, tours)
 *  3. Include a few "ongoing" events (current date is May 2026)
 *  4. Use artist's albumCoverUrl as imageUrl
 *  5. Store in KV key: events:upcoming
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify, getArtGradient } from './helpers'

// ── Types ─────────────────────────────────────────────────────

export interface ConcertEvent {
  id: string
  title: string
  artist: string
  artistSlug: string
  venue: string
  city: string
  country: string
  date: string
  endDate?: string
  type: 'concert' | 'festival' | 'tour' | 'virtual'
  status: 'upcoming' | 'ongoing' | 'sold-out'
  imageUrl: string
  ticketUrl?: string
  description: string
  slug: string
  lat?: number
  lng?: number
}

interface TrendingItem {
  id: string
  songId?: string
  songTitle: string
  artistName: string
  rank: number
  metric: number
  platform: string
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

// ── Venue data ────────────────────────────────────────────────

const VENUES: Record<string, Array<{ name: string; capacity: string }>> = {
  'New York': [
    { name: 'Madison Square Garden', capacity: '20,789' },
    { name: 'Barclays Center', capacity: '19,000' },
    { name: 'Radio City Music Hall', capacity: '6,015' },
    { name: 'Terminal 5', capacity: '3,000' },
  ],
  'Los Angeles': [
    { name: 'SoFi Stadium', capacity: '70,240' },
    { name: 'The Forum', capacity: '17,500' },
    { name: 'Hollywood Bowl', capacity: '17,500' },
    { name: 'Crypto.com Arena', capacity: '20,000' },
  ],
  'London': [
    { name: 'The O2 Arena', capacity: '20,000' },
    { name: 'Wembley Stadium', capacity: '90,000' },
    { name: 'O2 Academy Brixton', capacity: '4,921' },
    { name: 'Royal Albert Hall', capacity: '5,272' },
  ],
  'Lagos': [
    { name: 'Eko Convention Centre', capacity: '5,000' },
    { name: 'Teslim Balogun Stadium', capacity: '24,325' },
    { name: 'Federal Palace Hotel', capacity: '2,000' },
  ],
  'Seoul': [
    { name: 'Olympic Gymnastics Arena', capacity: '15,000' },
    { name: 'Jamsil Arena', capacity: '13,409' },
    { name: 'KSPO Dome', capacity: '14,530' },
  ],
  'Tokyo': [
    { name: 'Tokyo Dome', capacity: '55,000' },
    { name: 'Budokan', capacity: '14,471' },
    { name: 'Saitama Super Arena', capacity: '37,000' },
  ],
  'Paris': [
    { name: 'Accor Arena', capacity: '20,300' },
    { name: 'Stade de France', capacity: '81,338' },
    { name: 'Olympia', capacity: '2,000' },
  ],
  'Berlin': [
    { name: 'Mercedes-Benz Arena', capacity: '17,000' },
    { name: 'Waldbühne', capacity: '22,000' },
    { name: 'Columbiahalle', capacity: '3,500' },
  ],
  'Sydney': [
    { name: 'Qudos Bank Arena', capacity: '21,000' },
    { name: 'Sydney Opera House', capacity: '5,738' },
    { name: 'The Hordern Pavilion', capacity: '5,500' },
  ],
  'Toronto': [
    { name: 'Scotiabank Arena', capacity: '19,800' },
    { name: 'Rogers Centre', capacity: '49,500' },
    { name: 'Massey Hall', capacity: '2,765' },
  ],
  'Mumbai': [
    { name: 'NSCI Dome', capacity: '7,000' },
    { name: 'MMRDA Grounds', capacity: '25,000' },
    { name: 'NCPA', capacity: '1,100' },
  ],
  'São Paulo': [
    { name: 'Allianz Parque', capacity: '43,713' },
    { name: 'Arena Anhembi', capacity: '30,000' },
    { name: 'Credicard Hall', capacity: '7,748' },
  ],
  'Dubai': [
    { name: 'Coca-Cola Arena', capacity: '17,000' },
    { name: 'Dubai Opera', capacity: '2,000' },
    { name: 'Media City Amphitheatre', capacity: '15,000' },
  ],
}

const CITIES = Object.keys(VENUES)

const COUNTRY_MAP: Record<string, string> = {
  'New York': 'United States',
  'Los Angeles': 'United States',
  'London': 'United Kingdom',
  'Lagos': 'Nigeria',
  'Seoul': 'South Korea',
  'Tokyo': 'Japan',
  'Paris': 'France',
  'Berlin': 'Germany',
  'Sydney': 'Australia',
  'Toronto': 'Canada',
  'Mumbai': 'India',
  'São Paulo': 'Brazil',
  'Dubai': 'United Arab Emirates',
}

// Approximate coordinates for each city (for "near you" feature)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
}

const FESTIVAL_NAMES = [
  'Glastonbury Festival', 'Coachella', 'Summerfest', 'Roskilde Festival',
  'Fuji Rock Festival', 'Lollapalooza', 'Primavera Sound', 'Rock am Ring',
  'Splendour in the Grass', 'Afro Nation', 'Wireless Festival', 'BTS Festa',
  'Rock in Rio', 'Essence Festival', 'Tomorrowland', 'Exit Festival',
  'Sónar', 'Melt! Festival', 'Field Day', 'Outlook Festival',
]

const TOUR_SUFFIXES = [
  'World Tour 2026', 'Global Tour', 'Live in 2026', 'The Big Tour',
  'Summer Tour 2026', 'Unplugged Tour', 'Arena Tour 2026', 'The Experience Tour',
]

const DESCRIPTIONS: Record<string, string[]> = {
  concert: [
    'An unforgettable night of live music featuring the artist\'s biggest hits and fan favorites.',
    'Experience the magic live with stunning production and an electrifying atmosphere.',
    'Don\'t miss this chance to see one of music\'s biggest stars perform live in an intimate setting.',
    'A must-see concert event with full band, spectacular visuals, and surprise guests.',
  ],
  festival: [
    'One of the world\'s premier music festivals featuring top artists across multiple stages.',
    'A multi-day celebration of music, art, and culture featuring an incredible lineup.',
    'Join thousands of music fans for an unforgettable festival experience with top-tier performances.',
    'The ultimate summer festival experience with genre-spanning acts and immersive stages.',
  ],
  tour: [
    'The highly anticipated tour brings spectacular production and career-spanning setlists to arenas worldwide.',
    'A career-defining tour featuring hits from every era, with state-of-the-art stage design.',
    'Witness a once-in-a-lifetime performance as the artist takes their biggest show on the road.',
    'The tour that everyone\'s talking about — featuring new material and reimagined classics.',
  ],
  virtual: [
    'A groundbreaking virtual concert experience with interactive visuals and immersive sound.',
    'Experience the show from anywhere in the world with this innovative live-streamed event.',
    'The future of live music: a virtual performance with cutting-edge technology and real-time interaction.',
  ],
}

// ── Main scraper ──────────────────────────────────────────────

export async function scrapeEvents(env: Env): Promise<void> {
  console.log('[events] Starting...')

  try {
    // Collect trending items from all platforms to get artist names and images
    const platforms = ['tiktok', 'twitter', 'youtube', 'spotify', 'apple', 'deezer', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']
    const allTrending: TrendingItem[] = []

    for (const platform of platforms) {
      const data = await readKV<TrendingItem>(env, `trending:${platform}`)
      if (data?.items) {
        allTrending.push(...data.items)
      }
    }

    if (allTrending.length === 0) {
      console.log('[events] No trending data available — skipping')
      return
    }

    // Extract unique artists with their images and song counts
    const artistMap = new Map<string, { name: string; imageUrl: string; songCount: number; topRank: number; topSong: string }>()
    for (const item of allTrending) {
      const existing = artistMap.get(item.artistName)
      if (existing) {
        existing.songCount++
        if (item.rank < existing.topRank) {
          existing.topRank = item.rank
          existing.topSong = item.songTitle
        }
        if (!existing.imageUrl && item.albumCoverUrl) {
          existing.imageUrl = item.albumCoverUrl
        }
      } else {
        artistMap.set(item.artistName, {
          name: item.artistName,
          imageUrl: item.albumCoverUrl || '',
          songCount: 1,
          topRank: item.rank,
          topSong: item.songTitle,
        })
      }
    }

    // Sort artists by song count and rank
    const topArtists = Array.from(artistMap.values())
      .sort((a, b) => {
        if (b.songCount !== a.songCount) return b.songCount - a.songCount
        return a.topRank - b.topRank
      })

    if (topArtists.length === 0) {
      console.log('[events] No artists found — skipping')
      return
    }

    // Generate 20 events
    const events: ConcertEvent[] = []
    const now = new Date()
    // Base date: May 2026
    const baseDate = new Date(2026, 4, 1) // May 1, 2026

    // ── Generate events ──────────────────────────────────

    // 8 concerts
    for (let i = 0; i < 8 && i < topArtists.length; i++) {
      const artist = topArtists[i]
      const city = CITIES[i % CITIES.length]
      const venue = VENUES[city][i % VENUES[city].length]
      const eventDate = randomDate(baseDate, 180) // Within 6 months
      const isOngoing = eventDate <= now && new Date(eventDate.getTime() + 86400000) >= now
      const isSoldOut = Math.random() < 0.2 // 20% chance of sold out

      events.push(createEvent({
        id: `event-concert-${i}`,
        artist: artist.name,
        artistSlug: slugify(artist.name),
        imageUrl: artist.imageUrl,
        venue: venue.name,
        city,
        country: COUNTRY_MAP[city],
        date: formatDate(eventDate),
        type: 'concert',
        status: isOngoing ? 'ongoing' : isSoldOut ? 'sold-out' : 'upcoming',
        title: `${artist.name} Live at ${venue.name}`,
        description: pickRandom(DESCRIPTIONS.concert),
      }))
    }

    // 6 festivals
    for (let i = 0; i < 6 && i < topArtists.length; i++) {
      const artist = topArtists[i % topArtists.length]
      const festivalCity = CITIES[(i + 3) % CITIES.length]
      const festivalVenue = VENUES[festivalCity][0] // Use main venue for festivals
      const eventDate = randomDate(baseDate, 180)
      const endDate = new Date(eventDate.getTime() + (2 + Math.floor(Math.random() * 3)) * 86400000)
      const isOngoing = eventDate <= now && endDate >= now

      events.push(createEvent({
        id: `event-festival-${i}`,
        artist: artist.name,
        artistSlug: slugify(artist.name),
        imageUrl: artist.imageUrl,
        venue: festivalVenue.name,
        city: festivalCity,
        country: COUNTRY_MAP[festivalCity],
        date: formatDate(eventDate),
        endDate: formatDate(endDate),
        type: 'festival',
        status: isOngoing ? 'ongoing' : 'upcoming',
        title: `${FESTIVAL_NAMES[i % FESTIVAL_NAMES.length]} ${eventDate.getFullYear()}`,
        description: pickRandom(DESCRIPTIONS.festival),
      }))
    }

    // 4 tours
    for (let i = 0; i < 4 && i < topArtists.length; i++) {
      const artist = topArtists[i % topArtists.length]
      const tourCity = CITIES[(i + 6) % CITIES.length]
      const tourVenue = VENUES[tourCity][(i + 1) % VENUES[tourCity].length]
      const eventDate = randomDate(baseDate, 180)
      const isOngoing = eventDate <= now && new Date(eventDate.getTime() + 86400000) >= now
      const isSoldOut = Math.random() < 0.15

      events.push(createEvent({
        id: `event-tour-${i}`,
        artist: artist.name,
        artistSlug: slugify(artist.name),
        imageUrl: artist.imageUrl,
        venue: tourVenue.name,
        city: tourCity,
        country: COUNTRY_MAP[tourCity],
        date: formatDate(eventDate),
        type: 'tour',
        status: isOngoing ? 'ongoing' : isSoldOut ? 'sold-out' : 'upcoming',
        title: `${artist.name} ${TOUR_SUFFIXES[i % TOUR_SUFFIXES.length]}`,
        description: pickRandom(DESCRIPTIONS.tour),
      }))
    }

    // 2 virtual events
    for (let i = 0; i < 2 && i < topArtists.length; i++) {
      const artist = topArtists[(i + 5) % topArtists.length]
      const eventDate = randomDate(baseDate, 180)
      const isOngoing = eventDate <= now && new Date(eventDate.getTime() + 86400000) >= now

      events.push(createEvent({
        id: `event-virtual-${i}`,
        artist: artist.name,
        artistSlug: slugify(artist.name),
        imageUrl: artist.imageUrl,
        venue: 'Virtual / Online',
        city: 'Global',
        country: 'Worldwide',
        date: formatDate(eventDate),
        type: 'virtual',
        status: isOngoing ? 'ongoing' : 'upcoming',
        title: `${artist.name}: Virtual Live Experience`,
        description: pickRandom(DESCRIPTIONS.virtual),
      }))
    }

    // Ensure at least 2 events are "ongoing" (current date is May 2026)
    const ongoingCount = events.filter(e => e.status === 'ongoing').length
    if (ongoingCount < 2 && events.length >= 2) {
      // Force the first 2 events to be ongoing
      for (let i = 0; i < Math.min(2, events.length); i++) {
        // Set date to today-ish
        const today = new Date(2026, 4, 18) // ~mid May 2026
        events[i] = {
          ...events[i],
          date: formatDate(today),
          status: 'ongoing',
        }
      }
    }

    // Store in KV
    await writeKV(env, 'events:upcoming', events)
    console.log(`[events] ${events.length} events generated and written`)

  } catch (err) {
    console.error('[events] error:', err)
  }
}

// ── Helpers ───────────────────────────────────────────────────

function createEvent(opts: {
  id: string
  artist: string
  artistSlug: string
  imageUrl: string
  venue: string
  city: string
  country: string
  date: string
  endDate?: string
  type: ConcertEvent['type']
  status: ConcertEvent['status']
  title: string
  description: string
}): ConcertEvent {
  const coords = CITY_COORDS[opts.city]
  return {
    id: opts.id,
    title: opts.title,
    artist: opts.artist,
    artistSlug: opts.artistSlug,
    venue: opts.venue,
    city: opts.city,
    country: opts.country,
    date: opts.date,
    endDate: opts.endDate,
    type: opts.type,
    status: opts.status,
    imageUrl: opts.imageUrl,
    ticketUrl: `https://musicpulse.app/events/${slugify(opts.title)}`,
    description: opts.description,
    slug: slugify(opts.title),
    lat: coords?.lat,
    lng: coords?.lng,
  }
}

function randomDate(base: Date, maxDaysAhead: number): Date {
  const daysOffset = Math.floor(Math.random() * maxDaysAhead)
  const result = new Date(base.getTime() + daysOffset * 86400000)
  // Set a realistic evening time
  result.setHours(19 + Math.floor(Math.random() * 3), Math.random() < 0.5 ? 0 : 30, 0, 0)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString()
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
