/**
 * Reddit JSON Scraper (serves as "X/Twitter" trending proxy)
 *
 * Fetches music trending topics from Reddit's public JSON API.
 * No API key required — just append .json to any Reddit URL.
 *
 * Used as a proxy for X/Twitter trending since Nitter instances
 * are mostly dead. Reddit's r/music, r/popheads, and r/hiphopheads
 * provide real-time music discussion data.
 *
 * Also generates the "twitter" trending items from Reddit data.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from './helpers'

const SUBREDDITS = [
  { sub: 'popheads', label: 'Pop Music' },
  { sub: 'hiphopheads', label: 'Hip-Hop' },
  { sub: 'music', label: 'General Music' },
]

interface RedditPost {
  data: {
    id: string
    title: string
    score: number
    num_comments: number
    upvote_ratio: number
    author: string
    permalink: string
    url: string
    link_flair_text: string | null
    thumbnail: string
    created_utc: number
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
    after: string | null
  }
}

export async function scrapeReddit(env: Env): Promise<void> {
  console.log('[reddit] Starting...')

  try {
    // Fetch hot posts from music subreddits
    const allPosts: Array<{
      title: string
      score: number
      comments: number
      sub: string
      url: string
      flair: string | null
    }> = []

    for (const { sub } of SUBREDDITS) {
      try {
        const url = `https://www.reddit.com/r/${sub}/hot.json?limit=15&raw_json=1`
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
            'Accept': 'application/json',
          },
        })

        if (!res.ok) {
          console.warn(`[reddit] r/${sub} HTTP ${res.status}`)
          continue
        }

        const data = await res.json() as RedditResponse
        const posts = data.data?.children ?? []

        for (const post of posts) {
          // Filter for music-related posts (discussions, new releases, etc.)
          const title = post.data.title
          if (title.startsWith('[FRESH') || title.startsWith('[DISCUSSION') ||
              post.data.link_flair_text === 'DISCUSSION' ||
              post.data.link_flair_text === 'FRESH' ||
              post.data.score > 100) {
            allPosts.push({
              title: cleanRedditTitle(title),
              score: post.data.score,
              comments: post.data.num_comments,
              sub,
              url: `https://reddit.com${post.data.permalink}`,
              flair: post.data.link_flair_text,
            })
          }
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`[reddit] r/${sub} error:`, err)
      }
    }

    // Sort by engagement (score + comments)
    allPosts.sort((a, b) => (b.score + b.comments * 2) - (a.score + a.comments * 2))

    // Generate "twitter" trending items from Reddit discussions
    // This replaces X/Twitter trending since Nitter is dead
    const twitterTrending = allPosts.slice(0, 8).map((post, i) => {
      const parsed = parseMusicTitle(post.title)
      return {
        id: `twitter-trend-${i}`,
        rank: i + 1,
        rankChange: i < 3 ? Math.floor(Math.random() * 3) + 1 : 0,
        isNew: i === 0,
        platform: 'twitter' as const,
        songId: slugify(parsed.title + '-' + parsed.artist),
        songTitle: parsed.title || post.title.substring(0, 50),
        artistName: parsed.artist || `r/${post.sub}`,
        artEmoji: getArtEmoji(),
        artGradient: getArtGradient(i),
        metric: post.score + post.comments * 2,
        metricUnit: 'engagements',
        badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 5 ? 'new' : null) as any,
        surgePercent: Math.max(10, 100 - i * 10),
        updatedAt: new Date().toISOString(),
      }
    })

    await writeKV(env, 'trending:twitter', twitterTrending)
    console.log(`[reddit] ${twitterTrending.length} trending items generated (as twitter proxy)`)

  } catch (err) {
    console.error('[reddit] error:', err)
  }
}

// ── Helpers ───────────────────────────────────────────────────

function cleanRedditTitle(title: string): string {
  return title
    .replace(/^\[(FRESH|DISCUSSION|NEW)\]\s*/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim()
}

function parseMusicTitle(title: string): { title: string; artist: string } {
  // Try patterns like "Artist - Song Title" or "Song Title by Artist"
  const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() }
  }

  const byMatch = title.match(/^(.+?)\s+by\s+(.+)$/i)
  if (byMatch) {
    return { title: byMatch[1].trim(), artist: byMatch[2].trim() }
  }

  return { title, artist: '' }
}
