/**
 * MusicPulse Data Layer
 *
 * All data fetching goes through this file.
 * Strategy: Try the Worker API first → return empty data if unavailable.
 *
 * Set NEXT_PUBLIC_API_URL to your deployed Worker URL to enable live data.
 * If the Worker is unreachable or returns an error, empty data is returned.
 */

import type {
  ChartEntry, TrendingItem, CrossPlatformScore,
  VelocityItem, GenreHeatRow, Genre, Artist, Song, Album,
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
    // Network error, timeout, or CORS issue — return fallback
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
    [],
  )
}

export async function getCountryCharts(): Promise<
  Array<{ region: ChartRegion; flag: string; name: string; topSong: string; topArtist: string }>
> {
  return apiFetch(
    '/api/charts/countries',
    [],
  )
}

// ─── TRENDING ──────────────────────────────────────────────────

export async function getTrending(
  platform: TrendingPlatform,
  limit = 8,
): Promise<TrendingItem[]> {
  return apiFetch<TrendingItem[]>(
    `/api/trending?platform=${platform}&limit=${limit}`,
    [],
  )
}

export async function getCrossPlatformScores(limit = 5): Promise<CrossPlatformScore[]> {
  return apiFetch<CrossPlatformScore[]>(
    `/api/trending/cross-platform?limit=${limit}`,
    [],
  )
}

export async function getVelocityItems(limit = 5): Promise<VelocityItem[]> {
  return apiFetch<VelocityItem[]>(
    `/api/trending/velocity?limit=${limit}`,
    [],
  )
}

export async function getGenreHeatmap(): Promise<GenreHeatRow[]> {
  return apiFetch<GenreHeatRow[]>(
    '/api/trending/heatmap',
    [],
  )
}

// ─── ARTISTS ───────────────────────────────────────────────────

export async function getArtist(slug: string): Promise<Artist | null> {
  return apiFetch<Artist | null>(
    `/api/artists/${slug}`,
    null,
  )
}

export async function getTopArtists(limit = 6): Promise<Artist[]> {
  return apiFetch<Artist[]>(
    `/api/artists?sort=listeners&limit=${limit}`,
    [],
  )
}

// ─── SONGS ─────────────────────────────────────────────────────

export async function getSong(slug: string): Promise<Song | null> {
  return apiFetch<Song | null>(
    `/api/songs/${slug}`,
    null,
  )
}

export async function getNewReleases(limit = 5): Promise<Album[]> {
  return apiFetch<Album[]>(
    `/api/albums/new?limit=${limit}`,
    [],
  )
}

// ─── GENRES ───────────────────────────────────────────────────

export async function getGenres(): Promise<Genre[]> {
  return apiFetch<Genre[]>(
    '/api/genres',
    [],
  )
}

export async function getGenreChart(slug: string, limit = 50): Promise<ChartEntry[]> {
  return apiFetch<ChartEntry[]>(
    `/api/genres/${slug}?limit=${limit}`,
    [],
  )
}
