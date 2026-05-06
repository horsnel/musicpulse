/**
 * Viral Velocity Normalizer
 *
 * Computes VelocityItem[] — songs with the highest growth rates
 * across all platforms. "Viral" means fast upward movement.
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
  rankChange: number
  isNew: boolean
  metric: number
  platform: string
  badge: string | null
  surgePercent?: number
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

const PLATFORMS = ['tiktok', 'youtube', 'spotify', 'apple', 'twitter', 'deezer', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart']

export async function computeVelocity(env: Env): Promise<void> {
  console.log('[velocity] Computing...')

  try {
    const allTrending: TrendingEntry[] = []

    for (const platform of PLATFORMS) {
      const data = await readKV<TrendingEntry>(env, `trending:${platform}`)
      if (data?.items) {
        allTrending.push(...data.items)
      }
    }

    if (allTrending.length === 0) {
      console.log('[velocity] No trending data available — skipping')
      return
    }

    // Deduplicate by song, keeping best platform performance
    const songMap = new Map<string, TrendingEntry & { platforms: string[]; albumCoverUrl: string }>()

    for (const item of allTrending) {
      const key = `${item.songTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      const existing = songMap.get(key)

      if (!existing) {
        songMap.set(key, { ...item, platforms: [item.platform], albumCoverUrl: item.albumCoverUrl || '' })
      } else {
        if (!existing.platforms.includes(item.platform)) {
          existing.platforms.push(item.platform)
        }
        // Keep the one with better rank, and preserve artwork
        if (item.rank < existing.rank) {
          Object.assign(existing, item, { platforms: existing.platforms, albumCoverUrl: existing.albumCoverUrl || item.albumCoverUrl || '' })
        } else if (!existing.albumCoverUrl && item.albumCoverUrl) {
          existing.albumCoverUrl = item.albumCoverUrl
        }
      }
    }

    // Compute velocity items
    const velocityItems = Array.from(songMap.values())
      .map(song => {
        const growthPercent = song.isNew ? null :
          song.surgePercent ? song.surgePercent * 8 :
          song.rankChange > 0 ? song.rankChange * 100 : 50

        const sparkline = generateSparkline(song.surgePercent || 50)

        const context = song.isNew ? 'New Entry' :
          song.platforms.length >= 3 ? 'Multi-platform surge' :
          song.badge === 'hot' ? 'Hot streak' :
          song.badge === 'rising' ? 'Rising fast' :
          `${song.platform} boost`

        return {
          rank: 0, // Will be set after sorting
          songId: song.songId || song.id,
          songTitle: song.songTitle,
          artistName: song.artistName,
          artEmoji: getArtEmoji(),
          artGradient: '',
          albumCoverUrl: song.albumCoverUrl || '',
          growthPercent,
          sparkline,
          context,
        }
      })
      .sort((a, b) => {
        const aVal = a.growthPercent ?? Infinity
        const bVal = b.growthPercent ?? Infinity
        return bVal - aVal
      })
      .slice(0, 20)
      .map((item, i) => ({ ...item, rank: i + 1, artGradient: getArtGradient(i) }))

    await writeKV(env, 'velocity', velocityItems)
    console.log(`[velocity] ${velocityItems.length} items computed`)

  } catch (err) {
    console.error('[velocity] error:', err)
  }
}

function generateSparkline(surgePercent: number): number[] {
  const peak = Math.min(1, surgePercent / 100)
  return Array.from({ length: 7 }, (_, i) => {
    const progress = i / 6
    const noise = (Math.random() - 0.5) * 0.1
    return Math.max(0, Math.min(1, peak * progress * progress + noise))
  })
}
