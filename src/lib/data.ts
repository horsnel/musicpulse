/**
 * MusicPulse Data Layer
 *
 * All data fetching goes through this file.
 * Strategy: Try the Worker API first → fall back to mock data.
 *
 * Set NEXT_PUBLIC_API_URL to your deployed Worker URL to enable live data.
 * If the Worker is unreachable or returns an error, mock data is used instead.
 *
 * Data sources (no key needed): Spotify Charts CSV, Apple Music RSS, Deezer, TikTok Creative Center
 * Data sources (key needed): YouTube, Last.fm, Genius, TheAudioDB, Setlist.fm, Musixmatch
 */

import type {
  ChartEntry, TrendingItem, CrossPlatformScore,
  VelocityItem, GenreHeatRow, Artist, Song, Album,
  Platform, ChartRegion, TrendingPlatform,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://musicpulse-api.odehebuka48.workers.dev'
const API_TIMEOUT = 8000 // 8 second timeout for API calls

// ─── API HELPER ────────────────────────────────────────────────

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  if (!API_URL) return fallback

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT)

    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
    clearTimeout(timer)

    if (!res.ok) return fallback

    const json = await res.json()
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data
    }
    if (json.data && !Array.isArray(json.data) && json.data) {
      return json.data
    }
    return fallback
  } catch {
    // Network error, timeout, or CORS issue — fall back to mock
    return fallback
  }
}

// ─── DATA STATUS ───────────────────────────────────────────────

/** Returns true if the app is connected to the live API */
export function isLiveMode(): boolean {
  return API_URL.length > 0
}

/** Fetches the last scrape timestamp from the API */
export async function getLastScrapeTime(): Promise<string | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/api/scrape/status`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data?.lastRun ?? null
  } catch {
    return null
  }
}

// ─── CHARTS ────────────────────────────────────────────────────

export async function getChartEntries(
  platform: Platform = 'spotify',
  region: ChartRegion = 'global',
  limit = 50,
): Promise<ChartEntry[]> {
  return apiFetch<ChartEntry[]>(
    `/api/charts?platform=${platform}&region=${region}&limit=${limit}`,
    MOCK_CHART_ENTRIES.slice(0, limit),
  )
}

export async function getCountryCharts(): Promise<
  Array<{ region: ChartRegion; flag: string; name: string; topSong: string; topArtist: string }>
> {
  return apiFetch(
    '/api/charts/countries',
    MOCK_COUNTRY_CHARTS,
  )
}

// ─── TRENDING ──────────────────────────────────────────────────

export async function getTrending(
  platform: TrendingPlatform,
  limit = 8,
): Promise<TrendingItem[]> {
  return apiFetch<TrendingItem[]>(
    `/api/trending?platform=${platform}&limit=${limit}`,
    MOCK_TRENDING[platform]?.slice(0, limit) ?? [],
  )
}

export async function getCrossPlatformScores(limit = 5): Promise<CrossPlatformScore[]> {
  return apiFetch<CrossPlatformScore[]>(
    `/api/trending/cross-platform?limit=${limit}`,
    MOCK_CROSS_PLATFORM.slice(0, limit),
  )
}

export async function getVelocityItems(limit = 5): Promise<VelocityItem[]> {
  return apiFetch<VelocityItem[]>(
    `/api/trending/velocity?limit=${limit}`,
    MOCK_VELOCITY.slice(0, limit),
  )
}

export async function getGenreHeatmap(): Promise<GenreHeatRow[]> {
  return apiFetch<GenreHeatRow[]>(
    '/api/trending/heatmap',
    MOCK_GENRE_HEAT,
  )
}

// ─── ARTISTS ───────────────────────────────────────────────────

export async function getArtist(slug: string): Promise<Artist | null> {
  return apiFetch<Artist | null>(
    `/api/artists/${slug}`,
    MOCK_ARTIST,
  )
}

export async function getTopArtists(limit = 6): Promise<Artist[]> {
  return apiFetch<Artist[]>(
    `/api/artists?sort=listeners&limit=${limit}`,
    MOCK_TOP_ARTISTS.slice(0, limit),
  )
}

// ─── SONGS ─────────────────────────────────────────────────────

export async function getSong(slug: string): Promise<Song | null> {
  return apiFetch<Song | null>(
    `/api/songs/${slug}`,
    MOCK_SONG,
  )
}

export async function getNewReleases(limit = 5): Promise<Album[]> {
  return apiFetch<Album[]>(
    `/api/albums/new?limit=${limit}`,
    MOCK_NEW_RELEASES.slice(0, limit),
  )
}

// ─── MOCK DATA (fallback when Worker API is unavailable) ───────

const MOCK_SONG: Song = {
  id: 'apt-rose-bruno',
  slug: 'apt-rose-bruno-mars',
  title: 'APT.',
  artistId: 'rose',
  artistName: 'Rose',
  artistSlug: 'rose',
  albumId: 'rosie',
  albumTitle: 'Rosie',
  durationMs: 208000,
  releaseDate: '2024-10-18',
  genres: ['K-Pop', 'Pop'],
  label: 'Atlantic Records',
  key: 'G Major',
  bpm: 128,
  language: 'KO/EN',
  tiktokUses: 4200000,
  popularityScore: 98,
  featuredArtists: ['Bruno Mars'],
}

const MOCK_ARTIST: Artist = {
  id: 'burna-boy',
  slug: 'burna-boy',
  name: 'Burna Boy',
  aka: 'African Giant',
  genres: ['Afrofusion', 'Afrobeats', 'Reggae', 'Dancehall'],
  origin: 'Lagos, Nigeria',
  monthlyListeners: 38900000,
  totalStreams: 8400000000,
  followers: 24600000,
  youtubeViews: 2100000000,
  activeSince: 2012,
  label: 'Atlantic / WEA',
  debutAlbum: 'L.I.F.E',
  albumCount: 7,
  verified: true,
}

const MOCK_TOP_ARTISTS: Artist[] = [
  { id: 'kendrick', slug: 'kendrick-lamar', name: 'Kendrick Lamar', genres: ['Hip-Hop', 'Rap'], monthlyListeners: 68400000, origin: 'US' },
  { id: 'billie', slug: 'billie-eilish', name: 'Billie Eilish', genres: ['Pop', 'Alt'], monthlyListeners: 55100000, origin: 'US' },
  { id: 'rose', slug: 'rose', name: 'Rose', genres: ['K-Pop', 'Pop'], monthlyListeners: 42800000, origin: 'KR' },
  { id: 'sabrina', slug: 'sabrina-carpenter', name: 'Sabrina Carpenter', genres: ['Pop'], monthlyListeners: 48200000, origin: 'US' },
  { id: 'burna', slug: 'burna-boy', name: 'Burna Boy', genres: ['Afrobeats'], monthlyListeners: 38900000, origin: 'NG' },
  { id: 'davido', slug: 'davido', name: 'Davido', genres: ['Afrobeats'], monthlyListeners: 22400000, origin: 'NG' },
]

const MOCK_NEW_RELEASES: Album[] = [
  { id: 'gnx', slug: 'gnx', title: 'GNX', artistId: 'kendrick', artistName: 'Kendrick Lamar', releaseDate: '2024-11-22', type: 'album', trackCount: 12, isLatest: true },
  { id: 'hmhas', slug: 'hit-me-hard-and-soft', title: 'HIT ME HARD AND SOFT', artistId: 'billie', artistName: 'Billie Eilish', releaseDate: '2024-05-17', type: 'album', trackCount: 10 },
  { id: 'rosie', slug: 'rosie', title: 'Rosie', artistId: 'rose', artistName: 'Rose', releaseDate: '2024-12-06', type: 'album', trackCount: 12 },
  { id: 'sns', slug: 'short-n-sweet', title: 'Short n Sweet', artistId: 'sabrina', artistName: 'Sabrina Carpenter', releaseDate: '2024-08-23', type: 'album', trackCount: 12 },
  { id: 'luther-single', slug: 'luther', title: 'luther', artistId: 'kendrick', artistName: 'Kendrick Lamar, SZA', releaseDate: '2025-01-03', type: 'single', trackCount: 1 },
]

const MOCK_CHART_ENTRIES: ChartEntry[] = [
  { id: 'c1', songId: 'dws', song: { id: 'dws', slug: 'die-with-a-smile', title: 'Die With A Smile', artistId: 'gaga', artistName: 'Lady Gaga, Bruno Mars', artistSlug: 'lady-gaga', durationMs: 237000, releaseDate: '2024-08-16', genres: ['Pop'], popularityScore: 96 }, platform: 'spotify', region: 'global', position: 1, positionChange: 0, isNewEntry: false, isReEntry: false, streams: 12400000, peakPosition: 1, weeksOnChart: 24, chartDate: '2025-04-27', sparklineData: [70, 60, 55, 50, 48, 46, 44] },
  { id: 'c2', songId: 'boaf', song: { id: 'boaf', slug: 'birds-of-a-feather', title: 'BIRDS OF A FEATHER', artistId: 'billie', artistName: 'Billie Eilish', artistSlug: 'billie-eilish', durationMs: 210000, releaseDate: '2024-05-17', genres: ['Pop', 'Alt'], popularityScore: 94 }, platform: 'spotify', region: 'global', position: 2, positionChange: 0, isNewEntry: false, isReEntry: false, streams: 11800000, peakPosition: 1, weeksOnChart: 31, chartDate: '2025-04-27', sparklineData: [11, 10, 10, 9, 9, 10, 11] },
  { id: 'c3', songId: 'apt', song: MOCK_SONG, platform: 'spotify', region: 'global', position: 3, positionChange: 5, isNewEntry: false, isReEntry: false, streams: 10900000, peakPosition: 1, weeksOnChart: 18, chartDate: '2025-04-27', sparklineData: [24, 20, 15, 9, 6, 7, 6] },
  { id: 'c4', songId: 'esp', song: { id: 'esp', slug: 'espresso', title: 'Espresso', artistId: 'sabrina', artistName: 'Sabrina Carpenter', artistSlug: 'sabrina-carpenter', durationMs: 175000, releaseDate: '2024-04-05', genres: ['Pop'], popularityScore: 91 }, platform: 'spotify', region: 'global', position: 4, positionChange: -1, isNewEntry: false, isReEntry: false, streams: 10100000, peakPosition: 1, weeksOnChart: 42, chartDate: '2025-04-27', sparklineData: [9, 8, 6, 6, 7, 8, 10] },
  { id: 'c5', songId: 'nlu', song: { id: 'nlu', slug: 'not-like-us', title: 'Not Like Us', artistId: 'kendrick', artistName: 'Kendrick Lamar', artistSlug: 'kendrick-lamar', durationMs: 274000, releaseDate: '2024-05-04', genres: ['Hip-Hop', 'Rap'], popularityScore: 93 }, platform: 'spotify', region: 'global', position: 5, positionChange: 3, isNewEntry: false, isReEntry: false, streams: 9700000, peakPosition: 1, weeksOnChart: 38, chartDate: '2025-04-27', sparklineData: [20, 22, 18, 14, 10, 8, 7] },
]

const MOCK_COUNTRY_CHARTS = [
  { region: 'us' as ChartRegion, flag: '\u{1F1FA}\u{1F1F8}', name: 'United States', topSong: 'Die With A Smile', topArtist: 'Lady Gaga, Bruno Mars' },
  { region: 'uk' as ChartRegion, flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom', topSong: 'BIRDS OF A FEATHER', topArtist: 'Billie Eilish' },
  { region: 'nigeria' as ChartRegion, flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', topSong: 'Commas', topArtist: 'Davido' },
  { region: 'korea' as ChartRegion, flag: '\u{1F1F0}\u{1F1F7}', name: 'South Korea', topSong: 'APT.', topArtist: 'Rose, Bruno Mars' },
  { region: 'brazil' as ChartRegion, flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil', topSong: 'Gata Only', topArtist: 'FloyyMenor' },
  { region: 'germany' as ChartRegion, flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany', topSong: 'Die With A Smile', topArtist: 'Lady Gaga, Bruno Mars' },
  { region: 'south-africa' as ChartRegion, flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa', topSong: 'Twe Twe', topArtist: 'Kizz Daniel' },
]

const MOCK_TRENDING: Record<TrendingPlatform, TrendingItem[]> = {
  tiktok: [
    { id: 'tt1', rank: 1, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 4200000, metricUnit: 'uses', badge: 'hot', surgePercent: 92, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt2', rank: 2, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 3800000, metricUnit: 'uses', badge: null, surgePercent: 82, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt3', rank: 3, rankChange: 2, isNew: false, platform: 'tiktok', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '\u{2615}', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', metric: 3100000, metricUnit: 'uses', badge: null, surgePercent: 72, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt4', rank: 4, rankChange: 4, isNew: false, platform: 'tiktok', songTitle: 'luther', artistName: 'Kendrick Lamar, SZA', artEmoji: '\u{1F3BA}', artGradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', metric: 2700000, metricUnit: 'uses', badge: 'rising', surgePercent: 62, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt5', rank: 5, rankChange: -1, isNew: false, platform: 'tiktok', songTitle: 'Lose Control', artistName: 'Teddy Swims', artEmoji: '\u{1F30A}', artGradient: 'linear-gradient(135deg,#0f2027,#2c5364)', metric: 2400000, metricUnit: 'uses', badge: null, surgePercent: 55, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt6', rank: 6, rankChange: 0, isNew: true, platform: 'tiktok', songTitle: 'Beautiful Things', artistName: 'Benson Boone', artEmoji: '\u{1F4AB}', artGradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)', metric: 2100000, metricUnit: 'uses', badge: 'new', surgePercent: 48, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt7', rank: 7, rankChange: 3, isNew: false, platform: 'tiktok', songTitle: 'Commas', artistName: 'Davido', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 1900000, metricUnit: 'uses', badge: null, surgePercent: 43, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt8', rank: 8, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 1700000, metricUnit: 'uses', badge: null, surgePercent: 38, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  twitter: [
    { id: 'tw1', rank: 1, rankChange: 0, isNew: false, platform: 'twitter', songTitle: '#KendrickLamar', artistName: 'Grammy performance', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 890000, metricUnit: 'tweets', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw2', rank: 2, rankChange: 1, isNew: false, platform: 'twitter', songTitle: '#GNCiSHAKA', artistName: 'New Burna Boy drop', artEmoji: '\u{1F30D}', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', metric: 650000, metricUnit: 'tweets', badge: null, surgePercent: 73, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw3', rank: 3, rankChange: 0, isNew: true, platform: 'twitter', songTitle: '#ChappellRoan', artistName: 'Pink Pony anniversary', artEmoji: '\u{1F339}', artGradient: 'linear-gradient(135deg,#b02060,#e05090)', metric: 420000, metricUnit: 'tweets', badge: 'new', surgePercent: 47, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw4', rank: 4, rankChange: -2, isNew: false, platform: 'twitter', songTitle: '#NewMusic', artistName: 'Friday releases thread', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a3060,#3060c0)', metric: 380000, metricUnit: 'tweets', badge: null, surgePercent: 43, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw5', rank: 5, rankChange: 5, isNew: false, platform: 'twitter', songTitle: '#WizKid', artistName: 'New album rumors', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 310000, metricUnit: 'tweets', badge: 'peak', surgePercent: 35, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  youtube: [
    { id: 'yt1', rank: 1, rankChange: 0, isNew: false, platform: 'youtube', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 280000000, metricUnit: 'views', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt2', rank: 2, rankChange: 1, isNew: false, platform: 'youtube', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 195000000, metricUnit: 'views', badge: null, surgePercent: 70, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt3', rank: 3, rankChange: 0, isNew: false, platform: 'youtube', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 180000000, metricUnit: 'views', badge: null, surgePercent: 64, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt4', rank: 4, rankChange: 2, isNew: false, platform: 'youtube', songTitle: 'Twe Twe', artistName: 'Kizz Daniel', artEmoji: '\u{1F30D}', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 92000000, metricUnit: 'views', badge: null, surgePercent: 33, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt5', rank: 5, rankChange: -1, isNew: false, platform: 'youtube', songTitle: 'Commas', artistName: 'Davido', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', metric: 74000000, metricUnit: 'views', badge: null, surgePercent: 26, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  spotify: [
    { id: 'sp1', rank: 1, rankChange: 0, isNew: false, platform: 'spotify', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 12400000, metricUnit: 'streams', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'sp2', rank: 2, rankChange: 0, isNew: false, platform: 'spotify', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 11800000, metricUnit: 'streams', badge: null, surgePercent: 88, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  apple: [
    { id: 'am1', rank: 1, rankChange: 0, isNew: false, platform: 'apple', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 8900000, metricUnit: 'plays', badge: 'hot', surgePercent: 96, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'am2', rank: 2, rankChange: 2, isNew: false, platform: 'apple', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 7600000, metricUnit: 'plays', badge: 'rising', surgePercent: 85, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'am3', rank: 3, rankChange: 0, isNew: false, platform: 'apple', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 6200000, metricUnit: 'plays', badge: null, surgePercent: 72, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'am4', rank: 4, rankChange: -1, isNew: false, platform: 'apple', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '\u{2615}', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', metric: 5800000, metricUnit: 'plays', badge: null, surgePercent: 64, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'am5', rank: 5, rankChange: 3, isNew: false, platform: 'apple', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 5100000, metricUnit: 'plays', badge: 'new', surgePercent: 55, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'am6', rank: 6, rankChange: 0, isNew: true, platform: 'apple', songTitle: 'luther', artistName: 'Kendrick Lamar, SZA', artEmoji: '\u{1F3BA}', artGradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', metric: 4700000, metricUnit: 'plays', badge: null, surgePercent: 48, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  soundcloud: [
    { id: 'sc1', rank: 1, rankChange: 1, isNew: false, platform: 'soundcloud', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 3200000, metricUnit: 'plays', badge: 'hot', surgePercent: 88, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'sc2', rank: 2, rankChange: 0, isNew: false, platform: 'soundcloud', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 2800000, metricUnit: 'plays', badge: 'rising', surgePercent: 75, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  billboard: [
    { id: 'bb1', rank: 1, rankChange: 0, isNew: false, platform: 'billboard', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 92000000, metricUnit: 'units', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'bb2', rank: 2, rankChange: 2, isNew: false, platform: 'billboard', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 78000000, metricUnit: 'units', badge: 'rising', surgePercent: 85, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  deezer: [
    { id: 'dz1', rank: 1, rankChange: 0, isNew: false, platform: 'deezer', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 9800000, metricUnit: 'streams', badge: 'hot', surgePercent: 95, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'dz2', rank: 2, rankChange: 1, isNew: false, platform: 'deezer', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 8400000, metricUnit: 'streams', badge: 'rising', surgePercent: 82, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'dz3', rank: 3, rankChange: 0, isNew: false, platform: 'deezer', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '\u{1F3B6}', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 7200000, metricUnit: 'streams', badge: null, surgePercent: 68, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'dz4', rank: 4, rankChange: 3, isNew: false, platform: 'deezer', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '\u{2615}', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', metric: 6100000, metricUnit: 'streams', badge: null, surgePercent: 55, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'dz5', rank: 5, rankChange: -1, isNew: false, platform: 'deezer', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 5300000, metricUnit: 'streams', badge: null, surgePercent: 42, updatedAt: '2025-04-27T12:00:00Z' },
  ],
}

const MOCK_CROSS_PLATFORM: CrossPlatformScore[] = [
  { songId: 'apt', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '\u{1F338}', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', platforms: ['tiktok', 'twitter', 'youtube', 'spotify'], score: 98 },
  { songId: 'dws', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '\u{1F3B5}', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', platforms: ['tiktok', 'youtube', 'spotify'], score: 94 },
  { songId: 'nlu', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', platforms: ['twitter', 'youtube', 'spotify'], score: 89 },
  { songId: 'esp', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '\u{2615}', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', platforms: ['tiktok', 'youtube'], score: 82 },
  { songId: 'commas', songTitle: 'Commas', artistName: 'Davido', artEmoji: '\u{1F30D}', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', platforms: ['tiktok', 'youtube', 'spotify'], score: 77 },
]

const MOCK_VELOCITY: VelocityItem[] = [
  { rank: 1, songId: 'bt', songTitle: 'Beautiful Things', artistName: 'Benson Boone', artEmoji: '\u{1F4AB}', artGradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)', growthPercent: null, sparkline: [0, 0, 0, 0.1, 0.4, 0.8, 1], context: 'New Entry' },
  { rank: 2, songId: 'luther', songTitle: 'luther', artistName: 'Kendrick Lamar, SZA', artEmoji: '\u{1F3BA}', artGradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', growthPercent: 840, sparkline: [0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1], context: 'Rising fast' },
  { rank: 3, songId: 'gata', songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris MJ', artEmoji: '\u{1F525}', artGradient: 'linear-gradient(135deg,#b85500,#ff8c00)', growthPercent: 620, sparkline: [0.1, 0.2, 0.3, 0.5, 0.7, 0.85, 1], context: 'TikTok surge' },
  { rank: 4, songId: 'nlu', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '\u{1F3A4}', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', growthPercent: 380, sparkline: [0.2, 0.3, 0.4, 0.55, 0.7, 0.85, 1], context: 'Grammy boost' },
  { rank: 5, songId: 'disease', songTitle: 'Disease', artistName: 'Lady Gaga', artEmoji: '\u{2728}', artGradient: 'linear-gradient(135deg,#6a1a6e,#b06cff)', growthPercent: 290, sparkline: [0, 0, 0.1, 0.3, 0.6, 0.8, 1], context: 'New single' },
]

const MOCK_GENRE_HEAT: GenreHeatRow[] = [
  { genre: 'Pop',       days: [68, 72, 81, 78, 95, 92, 84] },
  { genre: 'Hip-Hop',  days: [44, 58, 61, 75, 98, 91, 80] },
  { genre: 'Afrobeats', days: [76, 80, 65, 72, 82, 90, 94] },
  { genre: 'K-Pop',    days: [60, 78, 88, 74, 62, 66, 48] },
  { genre: 'Latin',    days: [38, 42, 55, 60, 74, 78, 68] },
  { genre: 'R&B',      days: [22, 35, 40, 52, 58, 70, 64] },
]
