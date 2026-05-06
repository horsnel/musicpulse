/**
 * Cross-Platform Power Score Normalizer
 *
 * Computes CrossPlatformScore[] by analyzing which songs
 * appear across multiple platform trending lists.
 *
 * A song that's trending on 4+ platforms gets a high score (90+).
 * Score = (platforms_count / 5) * 100, boosted by metric rank.
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { getArtGradient, getArtEmoji } from '../scrapers/helpers'

interface TrendingEntry {
  id: string
  songId?: string
  songTitle: string
  artistName: string
  rank: number
  metric: number
  platform: string
  badge: string | null
  surgePercent?: number
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

const PLATFORMS = ['tiktok', 'youtube', 'spotify', 'apple', 'twitter', 'deezer', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart']

export async function computeCrossPlatform(env: Env): Promise<void> {
  console.log('[cross-platform] Computing...')

  try {
    // Collect all trending items across platforms
    const allTrending: TrendingEntry[] = []

    for (const platform of PLATFORMS) {
      const data = await readKV<TrendingEntry>(env, `trending:${platform}`)
      if (data?.items) {
        allTrending.push(...data.items)
      }
    }

    if (allTrending.length === 0) {
      console.log('[cross-platform] No trending data available — skipping')
      return
    }

    // Group by normalized song title + artist
    const songMap = new Map<string, {
      songTitle: string
      artistName: string
      platforms: string[]
      bestRank: number
      totalMetric: number
      maxSurge: number
      albumCoverUrl: string
    }>()

    for (const item of allTrending) {
      const key = normalizeKey(item.songTitle, item.artistName)
      const existing = songMap.get(key) || {
        songTitle: item.songTitle,
        artistName: item.artistName,
        platforms: [] as string[],
        bestRank: item.rank,
        totalMetric: 0,
        maxSurge: 0,
        albumCoverUrl: '',
      }

      if (!existing.platforms.includes(item.platform)) {
        existing.platforms.push(item.platform)
      }
      existing.bestRank = Math.min(existing.bestRank, item.rank)
      existing.totalMetric += item.metric || 0
      existing.maxSurge = Math.max(existing.maxSurge, item.surgePercent || 0)
      // Keep the best album cover URL (prefer non-empty)
      if (!existing.albumCoverUrl && item.albumCoverUrl) {
        existing.albumCoverUrl = item.albumCoverUrl
      }

      songMap.set(key, existing)
    }

    // Compute scores
    interface CrossPlatformEntry {
      songId: string
      songTitle: string
      artistName: string
      artEmoji: string
      artGradient: string
      albumCoverUrl: string
      platforms: string[]
      score: number
    }

    const scores: CrossPlatformEntry[] = Array.from(songMap.values())
      .map(song => {
        const platformWeight = (song.platforms.length / PLATFORMS.length) * 60
        const rankWeight = Math.max(0, (10 - song.bestRank)) * 3
        const surgeWeight = (song.maxSurge / 100) * 10
        return {
          songId: normalizeKey(song.songTitle, song.artistName),
          songTitle: song.songTitle,
          artistName: song.artistName,
          artEmoji: getArtEmoji(),
          artGradient: '',
          albumCoverUrl: song.albumCoverUrl || '',
          platforms: song.platforms,
          score: Math.min(100, Math.round(platformWeight + rankWeight + surgeWeight)),
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    // Assign gradients based on final sort order
    scores.forEach((s, i) => {
      s.artGradient = getArtGradient(i)
    })

    await writeKV(env, 'cross-platform', scores)
    console.log(`[cross-platform] ${scores.length} scores computed`)

  } catch (err) {
    console.error('[cross-platform] error:', err)
  }
}

function normalizeKey(title: string, artist: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}::${artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}
