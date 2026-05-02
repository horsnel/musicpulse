/**
 * MusicPulse Data Layer
 *
 * All data fetching goes through this file.
 * In production each function calls your Cloudflare D1 database via
 * the /api/* route handlers. During development mock data is returned.
 *
 * Swap `USE_MOCK` to false and fill in your D1 bindings when ready.
 */

import type {
  ChartEntry, TrendingItem, CrossPlatformScore,
  VelocityItem, GenreHeatRow, Artist, Song, Album,
  Platform, ChartRegion, TrendingPlatform,
} from '@/types'

const USE_MOCK = true
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── CHARTS ────────────────────────────────────────────────────

export async function getChartEntries(
  platform: Platform = 'spotify',
  region: ChartRegion = 'global',
  limit = 50,
): Promise<ChartEntry[]> {
  if (USE_MOCK) return MOCK_CHART_ENTRIES.slice(0, limit)

  const res = await fetch(
    `${BASE_URL}/api/charts?platform=${platform}&region=${region}&limit=${limit}`,
    {},
  )
  if (!res.ok) throw new Error('Failed to fetch chart entries')
  const json = await res.json()
  return json.data
}

export async function getCountryCharts(): Promise<
  Array<{ region: ChartRegion; flag: string; name: string; topSong: string; topArtist: string }>
> {
  if (USE_MOCK) return MOCK_COUNTRY_CHARTS
  const res = await fetch(`${BASE_URL}/api/charts/countries`, {
    
  })
  const json = await res.json()
  return json.data
}

// ─── TRENDING ──────────────────────────────────────────────────

export async function getTrending(
  platform: TrendingPlatform,
  limit = 8,
): Promise<TrendingItem[]> {
  if (USE_MOCK) return MOCK_TRENDING[platform]?.slice(0, limit) ?? []

  const res = await fetch(`${BASE_URL}/api/trending?platform=${platform}&limit=${limit}`, {
    
  })
  const json = await res.json()
  return json.data
}

export async function getCrossPlatformScores(limit = 5): Promise<CrossPlatformScore[]> {
  if (USE_MOCK) return MOCK_CROSS_PLATFORM.slice(0, limit)
  const res = await fetch(`${BASE_URL}/api/trending/cross-platform`, {
    
  })
  const json = await res.json()
  return json.data
}

export async function getVelocityItems(limit = 5): Promise<VelocityItem[]> {
  if (USE_MOCK) return MOCK_VELOCITY.slice(0, limit)
  const res = await fetch(`${BASE_URL}/api/trending/velocity`, {
    
  })
  const json = await res.json()
  return json.data
}

export async function getGenreHeatmap(): Promise<GenreHeatRow[]> {
  if (USE_MOCK) return MOCK_GENRE_HEAT
  const res = await fetch(`${BASE_URL}/api/trending/heatmap`, {
    
  })
  const json = await res.json()
  return json.data
}

// ─── ARTISTS ───────────────────────────────────────────────────

export async function getArtist(slug: string): Promise<Artist | null> {
  if (USE_MOCK) return MOCK_ARTIST
  const res = await fetch(`${BASE_URL}/api/artists/${slug}`, {
    
  })
  if (res.status === 404) return null
  const json = await res.json()
  return json.data
}

export async function getTopArtists(limit = 6): Promise<Artist[]> {
  if (USE_MOCK) return MOCK_TOP_ARTISTS.slice(0, limit)
  const res = await fetch(`${BASE_URL}/api/artists?sort=listeners&limit=${limit}`, {
    
  })
  const json = await res.json()
  return json.data
}

// ─── SONGS ─────────────────────────────────────────────────────

export async function getSong(slug: string): Promise<Song | null> {
  if (USE_MOCK) return MOCK_SONG
  const res = await fetch(`${BASE_URL}/api/songs/${slug}`, {
    
  })
  if (res.status === 404) return null
  const json = await res.json()
  return json.data
}

export async function getNewReleases(limit = 5): Promise<Album[]> {
  if (USE_MOCK) return MOCK_NEW_RELEASES.slice(0, limit)
  const res = await fetch(`${BASE_URL}/api/albums/new?limit=${limit}`, {
    
  })
  const json = await res.json()
  return json.data
}

// ─── MOCK DATA (replace with real D1 queries) ──────────────────

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
  { region: 'us' as ChartRegion, flag: '🇺🇸', name: 'United States', topSong: 'Die With A Smile', topArtist: 'Lady Gaga, Bruno Mars' },
  { region: 'uk' as ChartRegion, flag: '🇬🇧', name: 'United Kingdom', topSong: 'BIRDS OF A FEATHER', topArtist: 'Billie Eilish' },
  { region: 'nigeria' as ChartRegion, flag: '🇳🇬', name: 'Nigeria', topSong: 'Commas', topArtist: 'Davido' },
  { region: 'korea' as ChartRegion, flag: '🇰🇷', name: 'South Korea', topSong: 'APT.', topArtist: 'Rose, Bruno Mars' },
  { region: 'brazil' as ChartRegion, flag: '🇧🇷', name: 'Brazil', topSong: 'Gata Only', topArtist: 'FloyyMenor' },
  { region: 'germany' as ChartRegion, flag: '🇩🇪', name: 'Germany', topSong: 'Die With A Smile', topArtist: 'Lady Gaga, Bruno Mars' },
  { region: 'south-africa' as ChartRegion, flag: '🇿🇦', name: 'South Africa', topSong: 'Twe Twe', topArtist: 'Kizz Daniel' },
]

const MOCK_TRENDING: Record<TrendingPlatform, TrendingItem[]> = {
  tiktok: [
    { id: 'tt1', rank: 1, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '🌸', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 4200000, metricUnit: 'uses', badge: 'hot', surgePercent: 92, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt2', rank: 2, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '🎵', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 3800000, metricUnit: 'uses', badge: null, surgePercent: 82, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt3', rank: 3, rankChange: 2, isNew: false, platform: 'tiktok', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '☕', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', metric: 3100000, metricUnit: 'uses', badge: null, surgePercent: 72, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt4', rank: 4, rankChange: 4, isNew: false, platform: 'tiktok', songTitle: 'luther', artistName: 'Kendrick Lamar, SZA', artEmoji: '🎺', artGradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', metric: 2700000, metricUnit: 'uses', badge: 'rising', surgePercent: 62, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt5', rank: 5, rankChange: -1, isNew: false, platform: 'tiktok', songTitle: 'Lose Control', artistName: 'Teddy Swims', artEmoji: '🌊', artGradient: 'linear-gradient(135deg,#0f2027,#2c5364)', metric: 2400000, metricUnit: 'uses', badge: null, surgePercent: 55, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt6', rank: 6, rankChange: 0, isNew: true, platform: 'tiktok', songTitle: 'Beautiful Things', artistName: 'Benson Boone', artEmoji: '💫', artGradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)', metric: 2100000, metricUnit: 'uses', badge: 'new', surgePercent: 48, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt7', rank: 7, rankChange: 3, isNew: false, platform: 'tiktok', songTitle: 'Commas', artistName: 'Davido', artEmoji: '🎤', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 1900000, metricUnit: 'uses', badge: null, surgePercent: 43, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tt8', rank: 8, rankChange: 0, isNew: false, platform: 'tiktok', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '🎶', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 1700000, metricUnit: 'uses', badge: null, surgePercent: 38, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  twitter: [
    { id: 'tw1', rank: 1, rankChange: 0, isNew: false, platform: 'twitter', songTitle: '#KendrickLamar', artistName: 'Grammy performance', artEmoji: '🎤', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 890000, metricUnit: 'tweets', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw2', rank: 2, rankChange: 1, isNew: false, platform: 'twitter', songTitle: '#GNCiSHAKA', artistName: 'New Burna Boy drop', artEmoji: '🌍', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', metric: 650000, metricUnit: 'tweets', badge: null, surgePercent: 73, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw3', rank: 3, rankChange: 0, isNew: true, platform: 'twitter', songTitle: '#ChappellRoan', artistName: 'Pink Pony anniversary', artEmoji: '🌹', artGradient: 'linear-gradient(135deg,#b02060,#e05090)', metric: 420000, metricUnit: 'tweets', badge: 'new', surgePercent: 47, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw4', rank: 4, rankChange: -2, isNew: false, platform: 'twitter', songTitle: '#NewMusic', artistName: 'Friday releases thread', artEmoji: '🎵', artGradient: 'linear-gradient(135deg,#1a3060,#3060c0)', metric: 380000, metricUnit: 'tweets', badge: null, surgePercent: 43, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'tw5', rank: 5, rankChange: 5, isNew: false, platform: 'twitter', songTitle: '#WizKid', artistName: 'New album rumors', artEmoji: '🎶', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 310000, metricUnit: 'tweets', badge: 'peak', surgePercent: 35, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  youtube: [
    { id: 'yt1', rank: 1, rankChange: 0, isNew: false, platform: 'youtube', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '🎤', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', metric: 280000000, metricUnit: 'views', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt2', rank: 2, rankChange: 1, isNew: false, platform: 'youtube', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '🎵', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 195000000, metricUnit: 'views', badge: null, surgePercent: 70, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt3', rank: 3, rankChange: 0, isNew: false, platform: 'youtube', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '🌸', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', metric: 180000000, metricUnit: 'views', badge: null, surgePercent: 64, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt4', rank: 4, rankChange: 2, isNew: false, platform: 'youtube', songTitle: 'Twe Twe', artistName: 'Kizz Daniel', artEmoji: '🌍', artGradient: 'linear-gradient(135deg,#1a0a18,#381028)', metric: 92000000, metricUnit: 'views', badge: null, surgePercent: 33, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'yt5', rank: 5, rankChange: -1, isNew: false, platform: 'youtube', songTitle: 'Commas', artistName: 'Davido', artEmoji: '🎶', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', metric: 74000000, metricUnit: 'views', badge: null, surgePercent: 26, updatedAt: '2025-04-27T12:00:00Z' },
  ],
  spotify: [
    { id: 'sp1', rank: 1, rankChange: 0, isNew: false, platform: 'spotify', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '🎵', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', metric: 12400000, metricUnit: 'streams', badge: 'hot', surgePercent: 100, updatedAt: '2025-04-27T12:00:00Z' },
    { id: 'sp2', rank: 2, rankChange: 0, isNew: false, platform: 'spotify', songTitle: 'BIRDS OF A FEATHER', artistName: 'Billie Eilish', artEmoji: '🎶', artGradient: 'linear-gradient(135deg,#2d1b69,#11998e)', metric: 11800000, metricUnit: 'streams', badge: null, surgePercent: 88, updatedAt: '2025-04-27T12:00:00Z' },
  ],
}

const MOCK_CROSS_PLATFORM: CrossPlatformScore[] = [
  { songId: 'apt', songTitle: 'APT.', artistName: 'Rose, Bruno Mars', artEmoji: '🌸', artGradient: 'linear-gradient(135deg,#642b73,#c6426e)', platforms: ['tiktok', 'twitter', 'youtube', 'spotify'], score: 98 },
  { songId: 'dws', songTitle: 'Die With A Smile', artistName: 'Lady Gaga, Bruno Mars', artEmoji: '🎵', artGradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', platforms: ['tiktok', 'youtube', 'spotify'], score: 94 },
  { songId: 'nlu', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '🎤', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', platforms: ['twitter', 'youtube', 'spotify'], score: 89 },
  { songId: 'esp', songTitle: 'Espresso', artistName: 'Sabrina Carpenter', artEmoji: '☕', artGradient: 'linear-gradient(135deg,#134e5e,#71b280)', platforms: ['tiktok', 'youtube'], score: 82 },
  { songId: 'commas', songTitle: 'Commas', artistName: 'Davido', artEmoji: '🌍', artGradient: 'linear-gradient(135deg,#1a1000,#3a2800)', platforms: ['tiktok', 'youtube', 'spotify'], score: 77 },
]

const MOCK_VELOCITY: VelocityItem[] = [
  { rank: 1, songId: 'bt', songTitle: 'Beautiful Things', artistName: 'Benson Boone', artEmoji: '💫', artGradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)', growthPercent: null, sparkline: [0, 0, 0, 0.1, 0.4, 0.8, 1], context: 'New Entry' },
  { rank: 2, songId: 'luther', songTitle: 'luther', artistName: 'Kendrick Lamar, SZA', artEmoji: '🎺', artGradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', growthPercent: 840, sparkline: [0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1], context: 'Rising fast' },
  { rank: 3, songId: 'gata', songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris MJ', artEmoji: '🔥', artGradient: 'linear-gradient(135deg,#b85500,#ff8c00)', growthPercent: 620, sparkline: [0.1, 0.2, 0.3, 0.5, 0.7, 0.85, 1], context: 'TikTok surge' },
  { rank: 4, songId: 'nlu', songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', artEmoji: '🎤', artGradient: 'linear-gradient(135deg,#4b1248,#f10711)', growthPercent: 380, sparkline: [0.2, 0.3, 0.4, 0.55, 0.7, 0.85, 1], context: 'Grammy boost' },
  { rank: 5, songId: 'disease', songTitle: 'Disease', artistName: 'Lady Gaga', artEmoji: '✨', artGradient: 'linear-gradient(135deg,#6a1a6e,#b06cff)', growthPercent: 290, sparkline: [0, 0, 0.1, 0.3, 0.6, 0.8, 1], context: 'New single' },
]

const MOCK_GENRE_HEAT: GenreHeatRow[] = [
  { genre: 'Pop',       days: [68, 72, 81, 78, 95, 92, 84] },
  { genre: 'Hip-Hop',  days: [44, 58, 61, 75, 98, 91, 80] },
  { genre: 'Afrobeats', days: [76, 80, 65, 72, 82, 90, 94] },
  { genre: 'K-Pop',    days: [60, 78, 88, 74, 62, 66, 48] },
  { genre: 'Latin',    days: [38, 42, 55, 60, 74, 78, 68] },
  { genre: 'R&B',      days: [22, 35, 40, 52, 58, 70, 64] },
]
