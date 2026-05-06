/**
 * Social Media Charts Normalizer
 *
 * Reads social media trending data from KV (TikTok, Twitter, YouTube,
 * Bandcamp, Audiomack), groups songs by normalized title + artist,
 * and computes a social score:
 *
 *   socialScore = (platform_count * 15)
 *               + (total_engagement_normalized * 40)
 *               + (rank_bonus * 45)
 *
 * where:
 *   platform_count           = number of social platforms
 *   total_engagement_normalized = totalEngagement / maxTotalEngagement * 100
 *   rank_bonus               = 101 - bestRank
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { getArtGradient, getArtEmoji } from '../scrapers/helpers'

// ── Types ─────────────────────────────────────────────────────

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

interface SocialBreakdown {
  platform: string
  rank: number
  metric: number
  metricUnit: string
}

export interface SocialChartEntry {
  songId: string
  songTitle: string
  artistName: string
  albumCoverUrl: string
  artEmoji: string
  artGradient: string
  socialPlatforms: string[]
  totalEngagement: number
  bestRank: number
  platformCount: number
  socialScore: number
  breakdown: SocialBreakdown[]
}

// ── Social platforms ──────────────────────────────────────────

const SOCIAL_PLATFORMS = ['tiktok', 'twitter', 'youtube', 'bandcamp', 'audiomack']

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
  totalEngagement: number
  bestRank: number
  breakdown: SocialBreakdown[]
}

export async function computeSocialCharts(env: Env): Promise<void> {
  console.log('[social-charts] Computing...')

  try {
    const songMap = new Map<string, SongAccumulator>()

    for (const platform of SOCIAL_PLATFORMS) {
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
          totalEngagement: 0,
          bestRank: Infinity,
          breakdown: [] as SocialBreakdown[],
        }

        existing.platforms.add(platform)
        existing.totalEngagement += entry.metric || 0
        existing.bestRank = Math.min(existing.bestRank, entry.rank || Infinity)
        if (!existing.albumCoverUrl && entry.albumCoverUrl) {
          existing.albumCoverUrl = entry.albumCoverUrl
        }
        existing.breakdown.push({
          platform,
          rank: entry.rank || 0,
          metric: entry.metric || 0,
          metricUnit: entry.metricUnit || 'views',
        })

        songMap.set(key, existing)
      }
    }

    if (songMap.size === 0) {
      console.log('[social-charts] No social trending data available — skipping')
      return
    }

    // ── Compute scores ──────────────────────────────────────
    const maxTotalEngagement = Math.max(
      ...Array.from(songMap.values()).map(s => s.totalEngagement),
      1, // avoid division by zero
    )

    const results: SocialChartEntry[] = Array.from(songMap.values())
      .map(song => {
        const platformCount = song.platforms.size
        const totalEngagementNormalized = (song.totalEngagement / maxTotalEngagement) * 100
        const rankBonus = song.bestRank === Infinity ? 0 : 101 - song.bestRank

        const socialScore = Math.round(
          (platformCount * 15) +
          (totalEngagementNormalized * 40) +
          (rankBonus * 45),
        )

        return {
          songId: normalizeKey(song.songTitle, song.artistName),
          songTitle: song.songTitle,
          artistName: song.artistName,
          albumCoverUrl: song.albumCoverUrl || '',
          artEmoji: getArtEmoji(),
          artGradient: '',
          socialPlatforms: Array.from(song.platforms).sort(),
          totalEngagement: song.totalEngagement,
          bestRank: song.bestRank === Infinity ? 0 : song.bestRank,
          platformCount,
          socialScore,
          breakdown: song.breakdown,
        }
      })
      .sort((a, b) => b.socialScore - a.socialScore)
      .slice(0, 200)

    // Assign gradients based on final sort order
    results.forEach((entry, i) => {
      entry.artGradient = getArtGradient(i)
    })

    await writeKV(env, 'charts:social', results)
    console.log(`[social-charts] ${results.length} entries computed`)

  } catch (err) {
    console.error('[social-charts] error:', err)
  }
}
