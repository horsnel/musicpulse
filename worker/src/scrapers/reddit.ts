/**
 * Reddit RSS Scraper (serves as "X/Twitter" trending proxy)
 *
 * Fetches music trending topics from Reddit's public RSS/Atom feeds.
 * No API key required — just append .rss to any Reddit URL.
 *
 * IMPORTANT: Reddit's JSON API (.json) returns 403 from Cloudflare Workers.
 * The RSS/Atom feeds (.rss) are still publicly accessible, so we parse those
 * instead. RSS doesn't include score/comments, so we derive engagement from
 * rank position and use the hot-sort order as the relevance signal.
 *
 * Used as a proxy for X/Twitter trending since Nitter instances
 * are mostly dead. Reddit's r/music, r/popheads, and r/hiphopheads
 * provide real-time music discussion data.
 */

import { XMLParser } from 'fast-xml-parser'
import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from './helpers'

const SUBREDDITS = [
  { sub: 'popheads', label: 'Pop Music' },
  { sub: 'hiphopheads', label: 'Hip-Hop' },
  { sub: 'music', label: 'General Music' },
]

/** Bot / moderator accounts whose posts should be excluded */
const BOT_AUTHORS = new Set([
  '/u/AutoModerator',
  '/u/MusicReposts',
  'AutoModerator',
])

const xmlParser = new XMLParser({
  ignoreAttributes: false,        // we need @_href from <link>
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name) => name === 'entry',  // always treat <entry> as array
})

interface AtomEntry {
  title: string
  link: { '@_href': string; '@_rel'?: string; '@_type'?: string }
  author: { name: string; uri?: string }
  id: string
  published: string
  updated: string
  category: { '@_term': string; '@_label': string } | Array<{ '@_term': string; '@_label': string }>
  content?: string
}

export async function scrapeReddit(env: Env): Promise<void> {
  console.log('[reddit] Starting RSS scrape...')

  try {
    const allPosts: Array<{
      title: string
      sub: string
      url: string
      author: string
      publishedAt: string
      rank: number
    }> = []

    let globalRank = 0

    for (const { sub, label } of SUBREDDITS) {
      try {
        // Use RSS/Atom feed — .json is blocked (403) from Workers
        const url = `https://www.reddit.com/r/${sub}/hot.rss?limit=20`
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'MusicPulse/1.0 (by /u/musicpulse_bot)',
            'Accept': 'application/atom+xml,application/rss+xml,application/xml,text/xml',
          },
        })

        if (!res.ok) {
          console.warn(`[reddit] r/${sub} HTTP ${res.status}`)
          continue
        }

        const xml = await res.text()

        // Quick sanity check: if it looks like an HTML page instead of XML, skip
        if (xml.trimStart().startsWith('<!doctype') || xml.trimStart().startsWith('<html')) {
          console.warn(`[reddit] r/${sub} returned HTML instead of Atom feed (likely blocked)`)
          continue
        }

        const parsed = xmlParser.parse(xml)
        const entries: AtomEntry[] = parsed?.feed?.entry ?? []

        if (!Array.isArray(entries) || entries.length === 0) {
          console.warn(`[reddit] r/${sub} returned 0 entries`)
          continue
        }

        for (const entry of entries) {
          globalRank++

          const title = entry.title?.trim()
          if (!title) continue

          // Filter out bot/stickied posts (AutoModerator, weekly threads, etc.)
          const author = entry.author?.name?.trim() || ''
          if (BOT_AUTHORS.has(author)) continue

          // Filter out common sticky/mod thread patterns
          const lowerTitle = title.toLowerCase()
          if (
            lowerTitle.startsWith('daily discussion') ||
            lowerTitle.startsWith('weekly ') ||
            lowerTitle.startsWith('general discussion') ||
            lowerTitle.startsWith('moratorium') ||
            lowerTitle.includes('teatime &amp; trending') ||
            lowerTitle.includes('teatime & trending')
          ) {
            continue
          }

          const linkHref = entry.link?.['@_href'] || ''

          allPosts.push({
            title: cleanRedditTitle(title),
            sub,
            url: linkHref || `https://reddit.com/r/${sub}`,
            author: author.replace(/^\/u\//, ''),
            publishedAt: entry.published || entry.updated || new Date().toISOString(),
            rank: globalRank,
          })
        }

        // Rate limit between subreddits
        await new Promise(r => setTimeout(r, 400))
      } catch (err) {
        console.error(`[reddit] r/${sub} error:`, err)
      }
    }

    console.log(`[reddit] Collected ${allPosts.length} posts from ${SUBREDDITS.length} subreddits`)

    // Sort by rank (lower rank = higher on hot page = more engagement)
    allPosts.sort((a, b) => a.rank - b.rank)

    // Generate "twitter" trending items from Reddit discussions
    // Since RSS doesn't include score/comments, we derive engagement from rank
    const twitterTrending = allPosts.slice(0, 10).map((post, i) => {
      const parsed = parseMusicTitle(post.title)
      // Derive a synthetic engagement metric from rank (higher rank → more engagement)
      const engagement = Math.max(10, 500 - (post.rank - 1) * 30)

      return {
        id: `twitter-trend-${i}`,
        rank: i + 1,
        rankChange: i < 3 ? Math.floor(Math.random() * 3) + 1 : 0,
        isNew: i === 0,
        platform: 'twitter' as const,
        songId: slugify(parsed.title + '-' + parsed.artist),
        songTitle: parsed.title || post.title.substring(0, 60),
        artistName: parsed.artist || `r/${post.sub}`,
        artEmoji: getArtEmoji(),
        artGradient: getArtGradient(i),
        metric: engagement,
        metricUnit: 'engagements',
        badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 5 ? 'new' : null) as any,
        surgePercent: Math.max(10, 100 - i * 10),
        updatedAt: new Date().toISOString(),
        sourceUrl: post.url,
        sourceAuthor: post.author,
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
    .replace(/^\[(FRESH|DISCUSSION|NEW|REVIEW|VIDEO|ARTICLE|NEWS)\]\s*/i, '')
    .replace(/^\[.*?\]\s*/, '')       // remove any remaining [FLAIR] prefixes
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
