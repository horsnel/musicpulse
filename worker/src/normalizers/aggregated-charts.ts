/**
 * Aggregated Global Charts Normalizer
 *
 * Reads ALL chart data and ALL trending data from KV,
 * groups songs by normalized title + artist across ALL platforms,
 * and computes an aggregated score:
 *
 *   score = (platform_count * 15)
 *         + (total_metric_normalized * 40)
 *         + (rank_bonus * 45)
 *
 * where:
 *   platform_count        = number of platforms the song appears on
 *   total_metric_normalized = totalStreams / maxTotalStreams * 100
 *   rank_bonus            = 101 - bestRank
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from '../scrapers/helpers'

// ── Types ─────────────────────────────────────────────────────

interface ChartEntry {
  id: string
  songId: string
  song: {
    id: string
    slug: string
    title: string
    artistName: string
    albumCoverUrl?: string
    artEmoji?: string
    artGradient?: string
  }
  platform: string
  region: string
  position: number
  streams?: number
}

interface TrendingEntry {
  id: string
  songId?: string
  songTitle: string
  artistName: string
  rank: number
  metric: number
  metricUnit?: string
  platform: string
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

export interface AggregatedChartEntry {
  songId: string
  songTitle: string
  artistName: string
  albumCoverUrl: string
  artEmoji: string
  artGradient: string
  platforms: string[]
  totalStreams: number
  bestRank: number
  platformCount: number
  aggregatedScore: number
}

// ── Platform lists ────────────────────────────────────────────

const CHART_PLATFORMS = ['spotify', 'apple', 'deezer', 'youtube']
const CHART_REGIONS = ['global']

const TRENDING_PLATFORMS = [
  'spotify', 'apple', 'deezer', 'youtube',
  'tiktok', 'twitter', 'soundcloud', 'billboard',
  'bandcamp', 'audiomack', 'genius', 'musixmatch',
  'iheart', 'melon', 'oricon',
]

// ── Key normalizer ────────────────────────────────────────────

function normalizeKey(title: string, artist: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}::${artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

// ── Main ──────────────────────────────────────────────────────

interface SongAccumulator {
  songTitle: string
  artistName: string
  albumCoverUrl: string
  platforms: Set<string>
  totalStreams: number
  bestRank: number
}

export async function computeAggregatedCharts(env: Env): Promise<void> {
  console.log('[aggregated-charts] Computing...')

  try {
    const songMap = new Map<string, SongAccumulator>()

    // ── 1. Read chart data ──────────────────────────────────
    for (const platform of CHART_PLATFORMS) {
      for (const region of CHART_REGIONS) {
        const data = await readKV<ChartEntry>(env, `charts:${platform}:${region}`)
        if (!data?.items) continue

        for (const entry of data.items) {
          const title = entry.song?.title || ''
          const artist = entry.song?.artistName || ''
          if (!title || !artist) continue

          const key = normalizeKey(title, artist)
          const existing = songMap.get(key) || {
            songTitle: title,
            artistName: artist,
            albumCoverUrl: '',
            platforms: new Set<string>(),
            totalStreams: 0,
            bestRank: Infinity,
          }

          existing.platforms.add(platform)
          existing.totalStreams += entry.streams || 0
          existing.bestRank = Math.min(existing.bestRank, entry.position || Infinity)
          if (!existing.albumCoverUrl && entry.song?.albumCoverUrl) {
            existing.albumCoverUrl = entry.song.albumCoverUrl
          }

          songMap.set(key, existing)
        }
      }
    }

    // ── 2. Read trending data ───────────────────────────────
    for (const platform of TRENDING_PLATFORMS) {
      const data = await readKV<TrendingEntry>(env, `trending:${platform}`)
      if (!data?.items) continue

      for (const entry of data.items) {
        const title = entry.songTitle || ''
        const artist = entry.artistName || ''
        if (!title || !artist) continue

        const key = normalizeKey(title, artist)
        const existing = songMap.get(key) || {
          songTitle: title,
          artistName: artist,
          albumCoverUrl: '',
          platforms: new Set<string>(),
          totalStreams: 0,
          bestRank: Infinity,
        }

        existing.platforms.add(platform)
        existing.totalStreams += entry.metric || 0
        existing.bestRank = Math.min(existing.bestRank, entry.rank || Infinity)
        if (!existing.albumCoverUrl && entry.albumCoverUrl) {
          existing.albumCoverUrl = entry.albumCoverUrl
        }

        songMap.set(key, existing)
      }
    }

    if (songMap.size === 0) {
      console.log('[aggregated-charts] No data available — skipping')
      return
    }

    // ── 3. Compute scores ───────────────────────────────────
    const maxTotalStreams = Math.max(
      ...Array.from(songMap.values()).map(s => s.totalStreams),
      1, // avoid division by zero
    )

    const results: AggregatedChartEntry[] = Array.from(songMap.values())
      .map(song => {
        const platformCount = song.platforms.size
        const totalMetricNormalized = (song.totalStreams / maxTotalStreams) * 100
        const rankBonus = song.bestRank === Infinity ? 0 : 101 - song.bestRank

        const aggregatedScore = Math.round(
          (platformCount * 15) +
          (totalMetricNormalized * 40) +
          (rankBonus * 45),
        )

        return {
          songId: normalizeKey(song.songTitle, song.artistName),
          songTitle: song.songTitle,
          artistName: song.artistName,
          albumCoverUrl: song.albumCoverUrl || '',
          artEmoji: getArtEmoji(),
          artGradient: '',
          platforms: Array.from(song.platforms).sort(),
          totalStreams: song.totalStreams,
          bestRank: song.bestRank === Infinity ? 0 : song.bestRank,
          platformCount,
          aggregatedScore,
        }
      })
      .sort((a, b) => b.aggregatedScore - a.aggregatedScore)
      .slice(0, 200)

    // Assign gradients based on final sort order
    results.forEach((entry, i) => {
      entry.artGradient = getArtGradient(i)
    })

    await writeKV(env, 'charts:aggregated:global', results)
    console.log(`[aggregated-charts] ${results.length} entries computed`)

  } catch (err) {
    console.error('[aggregated-charts] error:', err)
  }
}
