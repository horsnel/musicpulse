// ─── ARTIST ────────────────────────────────────────────────────
export interface Artist {
  id: string
  slug: string
  name: string
  aka?: string
  bio?: string
  imageUrl?: string
  genres: string[]
  origin?: string
  monthlyListeners: number
  totalStreams?: number
  followers?: number
  youtubeViews?: number
  activeSince?: number
  label?: string
  debutAlbum?: string
  albumCount?: number
  verified?: boolean
  socialLinks?: {
    spotify?: string
    apple?: string
    youtube?: string
    tiktok?: string
    instagram?: string
    twitter?: string
  }
}

// ─── ALBUM ─────────────────────────────────────────────────────
export interface Album {
  id: string
  slug: string
  title: string
  artistId: string
  artistName: string
  releaseDate: string
  coverUrl?: string
  label?: string
  type: 'album' | 'ep' | 'single' | 'compilation'
  trackCount: number
  spotifyUrl?: string
  appleUrl?: string
  isLatest?: boolean
  isGrammy?: boolean
}

// ─── SONG ──────────────────────────────────────────────────────
export interface Song {
  id: string
  slug: string
  title: string
  artistId: string
  artistName: string
  artistSlug: string
  albumId?: string
  albumTitle?: string
  albumCoverUrl?: string
  durationMs: number
  releaseDate: string
  genres: string[]
  label?: string
  key?: string
  bpm?: number
  language?: string
  tiktokUses?: number
  spotifyUrl?: string
  appleUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  popularityScore?: number  // 0–100
  featuredArtists?: string[]
  artEmoji?: string          // placeholder until real art is wired up
  artGradient?: string       // CSS gradient string
}

// ─── CHART ENTRY ───────────────────────────────────────────────
export type Platform = 'spotify' | 'apple' | 'youtube' | 'shazam' | 'billboard' | 'deezer' | 'bandcamp' | 'audiomack' | 'genius' | 'musixmatch' | 'iheart'
export type ChartRegion = 'global' | 'nigeria' | 'us' | 'uk' | 'africa' | 'brazil' | 'korea' | 'germany' | 'south-africa'

export interface ChartEntry {
  id: string
  songId: string
  song: Song
  platform: Platform
  region: ChartRegion
  position: number
  positionChange: number  // positive = climbed, negative = fell, 0 = unchanged
  isNewEntry: boolean
  isReEntry: boolean
  streams?: number
  peakPosition: number
  weeksOnChart: number
  chartDate: string        // ISO date string
  sparklineData?: number[] // last 7 positions for mini chart
}

// ─── TRENDING ──────────────────────────────────────────────────
export type TrendingPlatform = 'tiktok' | 'twitter' | 'youtube' | 'spotify' | 'apple' | 'soundcloud' | 'billboard' | 'deezer' | 'bandcamp' | 'audiomack' | 'genius' | 'musixmatch' | 'iheart'
export type TrendBadge = 'hot' | 'rising' | 'new' | 'peak' | null

export interface TrendingItem {
  id: string
  rank: number
  rankChange: number
  isNew: boolean
  platform: TrendingPlatform
  songId?: string
  songTitle: string
  artistName: string
  artEmoji?: string          // placeholder until real art is wired up
  artGradient?: string       // CSS gradient string
  albumCoverUrl?: string     // real album cover from API
  metric: number             // uses / tweets / views / streams
  metricUnit: string         // "uses" | "tweets" | "views" | "streams"
  badge: TrendBadge
  surgePercent?: number
  updatedAt: string
}

export interface CrossPlatformScore {
  songId: string
  songTitle: string
  artistName: string
  artEmoji?: string
  artGradient?: string
  platforms: TrendingPlatform[]
  score: number  // 0–100
}

export interface VelocityItem {
  rank: number
  songId: string
  songTitle: string
  artistName: string
  artEmoji?: string
  artGradient?: string
  growthPercent: number | null  // null = new entry (∞)
  sparkline: number[]           // 7-point array normalised 0–1
  context: string               // e.g. "Grammy boost"
}

// ─── GENRE ──────────────────────────────────────────────────────
export interface Genre {
  slug: string
  name: string
  color: string
  songCount: number
}

// ─── GENRE HEATMAP ─────────────────────────────────────────────
export interface GenreHeatRow {
  genre: string
  days: number[]  // 7 values, 0–100 activity score
}

// ─── META / SEO ────────────────────────────────────────────────
export interface PageMeta {
  title: string
  description: string
  canonical?: string
  ogImage?: string
}

// ─── API RESPONSES ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  updatedAt: string
  nextUpdateAt?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}
