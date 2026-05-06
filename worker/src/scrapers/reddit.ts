/**
 * X/Twitter Trending Scraper
 *
 * Strategy:
 *  1. Primarily builds trending data from Apple Music and Deezer trending/chart data
 *     which already has clean song titles, artist names, and artwork URLs
 *  2. Supplements with Reddit posts that parse cleanly into song/artist
 *  3. This ensures every X/Twitter trending item has proper artwork
 */

import { XMLParser } from 'fast-xml-parser'
import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from './helpers'

const SUBREDDITS = [
  { sub: 'popheads', label: 'Pop Music' },
  { sub: 'hiphopheads', label: 'Hip-Hop' },
  { sub: 'music', label: 'General Music' },
]

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name) => name === 'entry',
})

export async function scrapeReddit(env: Env): Promise<void> {
  console.log('[reddit/x] Starting X/Twitter trending scrape...')

  try {
    // Step 1: Build artwork lookup from existing platform data
    const artworkLookup = await buildArtworkLookup(env)
    console.log(`[reddit/x] Built artwork lookup with ${artworkLookup.size} entries`)

    // Step 2: Start with top songs from Apple trending (has best artwork)
    const twitterTrending: any[] = []
    const seenSongIds = new Set<string>()

    // 2a: Add from Apple trending data (reliable artwork)
    const appleData = await readKV<any>(env, 'trending:apple')
    if (appleData?.items) {
      for (const item of appleData.items.slice(0, 5)) {
        const songId = slugify(item.songTitle + '-' + item.artistName)
        if (seenSongIds.has(songId)) continue
        seenSongIds.add(songId)
        twitterTrending.push({
          id: `twitter-trend-${twitterTrending.length + 1}`,
          rank: 0,
          rankChange: Math.floor(Math.random() * 3),
          isNew: false,
          platform: 'twitter' as const,
          songId: item.songId || songId,
          songTitle: item.songTitle,
          artistName: item.artistName,
          artEmoji: item.artEmoji || getArtEmoji(),
          artGradient: getArtGradient(twitterTrending.length),
          albumCoverUrl: item.albumCoverUrl || '',
          metric: Math.max(200, 600 - twitterTrending.length * 40),
          metricUnit: 'engagements',
          badge: 'hot' as any,
          surgePercent: Math.max(10, 100 - twitterTrending.length * 8),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // 2b: Add from Deezer trending data
    const deezerData = await readKV<any>(env, 'trending:deezer')
    if (deezerData?.items) {
      for (const item of deezerData.items.slice(0, 3)) {
        const songId = slugify(item.songTitle + '-' + item.artistName)
        if (seenSongIds.has(songId)) continue
        seenSongIds.add(songId)
        twitterTrending.push({
          id: `twitter-trend-${twitterTrending.length + 1}`,
          rank: 0,
          rankChange: Math.floor(Math.random() * 2),
          isNew: false,
          platform: 'twitter' as const,
          songId: item.songId || songId,
          songTitle: item.songTitle,
          artistName: item.artistName,
          artEmoji: item.artEmoji || getArtEmoji(),
          artGradient: getArtGradient(twitterTrending.length),
          albumCoverUrl: item.albumCoverUrl || '',
          metric: Math.max(100, 400 - twitterTrending.length * 30),
          metricUnit: 'engagements',
          badge: 'rising' as any,
          surgePercent: Math.max(10, 80 - twitterTrending.length * 6),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Step 3: Add Reddit posts that match known songs in our artwork lookup
    const redditPosts = await fetchRedditPosts()
    console.log(`[reddit/x] Collected ${redditPosts.length} Reddit posts`)

    for (const post of redditPosts) {
      if (twitterTrending.length >= 10) break

      const parsed = parseMusicTitle(post.title)
      if (!parsed.title || parsed.title.length < 3) continue
      // Skip posts that look like discussions, not songs
      if (parsed.title.split(' ').length > 8 && !parsed.artist) continue
      // Skip very long titles (likely discussions)
      if (parsed.title.length > 60) continue

      const songId = slugify(parsed.title + '-' + parsed.artist)
      if (seenSongIds.has(songId)) continue

      // Only add if we can find artwork for it
      const artworkUrl = findArtwork(parsed.title, parsed.artist, artworkLookup)
      if (!artworkUrl) continue // Skip songs without artwork

      seenSongIds.add(songId)
      twitterTrending.push({
        id: `twitter-trend-${twitterTrending.length + 1}`,
        rank: 0,
        rankChange: Math.floor(Math.random() * 3) + 1,
        isNew: false,
        platform: 'twitter' as const,
        songId,
        songTitle: parsed.title,
        artistName: parsed.artist || `r/${post.sub}`,
        artEmoji: getArtEmoji(),
        artGradient: getArtGradient(twitterTrending.length),
        albumCoverUrl: artworkUrl,
        metric: Math.max(50, 300 - twitterTrending.length * 25),
        metricUnit: 'engagements',
        badge: (twitterTrending.length < 7 ? 'new' : null) as any,
        surgePercent: Math.max(10, 70 - twitterTrending.length * 5),
        updatedAt: new Date().toISOString(),
        sourceUrl: post.url,
        sourceAuthor: post.author,
      })
    }

    // Step 4: Fill any remaining slots from Spotify chart data
    if (twitterTrending.length < 10) {
      const chartData = await readKV<any>(env, 'charts:spotify:global')
      if (chartData?.items) {
        for (const item of chartData.items) {
          if (twitterTrending.length >= 10) break
          const title = item.song?.title
          const artist = item.song?.artistName
          if (!title) continue
          const songId = slugify(title + '-' + artist)
          if (seenSongIds.has(songId)) continue
          seenSongIds.add(songId)
          twitterTrending.push({
            id: `twitter-trend-${twitterTrending.length + 1}`,
            rank: 0,
            rankChange: 0,
            isNew: false,
            platform: 'twitter' as const,
            songId: item.songId || songId,
            songTitle: title,
            artistName: artist || 'Unknown',
            artEmoji: getArtEmoji(),
            artGradient: getArtGradient(twitterTrending.length),
            albumCoverUrl: item.song?.albumCoverUrl || '',
            metric: Math.max(30, 200 - twitterTrending.length * 15),
            metricUnit: 'engagements',
            badge: null as any,
            surgePercent: Math.max(10, 60 - twitterTrending.length * 4),
            updatedAt: new Date().toISOString(),
          })
        }
      }
    }

    // Sort by metric (engagement) descending and re-rank
    twitterTrending.sort((a, b) => b.metric - a.metric)
    twitterTrending.forEach((item, i) => {
      item.rank = i + 1
      item.id = `twitter-trend-${i + 1}`
      item.isNew = i === 0
      item.badge = (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 5 ? 'new' : null) as any
    })

    await writeKV(env, 'trending:twitter', twitterTrending.slice(0, 10))
    console.log(`[reddit/x] ${twitterTrending.length} X/Twitter trending items, ${twitterTrending.filter(t => t.albumCoverUrl).length} with artwork`)

  } catch (err) {
    console.error('[reddit/x] error:', err)
  }
}

// ── Artwork Lookup ────────────────────────────────────────────

async function buildArtworkLookup(env: Env): Promise<Map<string, string>> {
  const lookup = new Map<string, string>()
  const platforms = ['apple', 'spotify', 'deezer', 'youtube', 'tiktok', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']

  for (const platform of platforms) {
    const data = await readKV<any>(env, `trending:${platform}`)
    if (!data?.items) continue
    for (const item of data.items) {
      if (item.albumCoverUrl && item.songTitle) {
        const key = normalizeKey(item.songTitle, item.artistName || '')
        if (!lookup.has(key)) lookup.set(key, item.albumCoverUrl)
        const titleKey = normalizeKey(item.songTitle, '')
        if (!lookup.has(titleKey)) lookup.set(titleKey, item.albumCoverUrl)
      }
    }
  }

  for (const platform of ['apple', 'spotify', 'deezer']) {
    for (const region of ['global', 'us']) {
      const data = await readKV<any>(env, `charts:${platform}:${region}`)
      if (!data?.items) continue
      for (const item of data.items) {
        if (item.song?.albumCoverUrl && item.song?.title) {
          const key = normalizeKey(item.song.title, item.song.artistName || '')
          if (!lookup.has(key)) lookup.set(key, item.song.albumCoverUrl)
          const titleKey = normalizeKey(item.song.title, '')
          if (!lookup.has(titleKey)) lookup.set(titleKey, item.song.albumCoverUrl)
        }
      }
    }
  }

  return lookup
}

function normalizeKey(title: string, artist: string): string {
  return (title + '|' + artist).toLowerCase().replace(/[^a-z0-9|]/g, '')
}

function findArtwork(title: string, artist: string, lookup: Map<string, string>): string {
  const exactKey = normalizeKey(title, artist)
  if (lookup.has(exactKey)) return lookup.get(exactKey)!
  const titleKey = normalizeKey(title, '')
  if (lookup.has(titleKey)) return lookup.get(titleKey)!
  // Partial match
  const titleStart = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
  for (const [key, url] of lookup) {
    const keyParts = key.split('|')
    if (keyParts[0].startsWith(titleStart)) return url
  }
  return ''
}

// ── Reddit Post Fetcher ──────────────────────────────────────

const BOT_AUTHORS = new Set(['/u/AutoModerator', '/u/MusicReposts', 'AutoModerator'])

const FILTER_PATTERNS = [
  /^daily discussion/i,
  /^weekly /i,
  /^general discussion/i,
  /^moratorium/i,
  /teatime/i,
  /trending thread/i,
  /chart.*week/i,
  /^rates/i,
  /^what's? your/i,
  /^who's? your/i,
  /^what are you listening/i,
  /subreddit/i,
  /moderator/i,
  /announcement/i,
  /meta:/i,
  /\[rate\]/i,
  /review:/i,
  /collection/i,
  /essential/i,
  /years? later/i,
  /years? ago/i,
  /ago today/i,
  /^my /i,
  /^the popheads/i,
  /^top ten/i,
]

async function fetchRedditPosts(): Promise<Array<{
  title: string
  sub: string
  url: string
  author: string
}>> {
  const posts: Array<{ title: string; sub: string; url: string; author: string }> = []

  for (const { sub } of SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${sub}/hot.rss?limit=20`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'MusicPulse/1.0 (by /u/musicpulse_bot)',
          'Accept': 'application/atom+xml,application/rss+xml,application/xml,text/xml',
        },
      })
      if (!res.ok) continue

      const xml = await res.text()
      if (xml.trimStart().startsWith('<!doctype') || xml.trimStart().startsWith('<html')) continue

      const parsed = xmlParser.parse(xml)
      const entries = parsed?.feed?.entry ?? []
      if (!Array.isArray(entries)) continue

      for (const entry of entries) {
        const title = entry.title?.trim()
        if (!title) continue

        const author = entry.author?.name?.trim() || ''
        if (BOT_AUTHORS.has(author)) continue

        const cleanTitle = cleanRedditTitle(title)
        if (FILTER_PATTERNS.some(p => p.test(cleanTitle) || p.test(title))) continue

        posts.push({
          title: cleanTitle,
          sub,
          url: entry.link?.['@_href'] || `https://reddit.com/r/${sub}`,
          author: author.replace(/^\/u\//, ''),
        })
      }

      await new Promise(r => setTimeout(r, 400))
    } catch (err) {
      console.error(`[reddit/x] r/${sub} error:`, err)
    }
  }

  return posts
}

// ── Helpers ───────────────────────────────────────────────────

function cleanRedditTitle(title: string): string {
  return title
    .replace(/^\[(FRESH|DISCUSSION|NEW|REVIEW|VIDEO|ARTICLE|NEWS|OFFICIAL)\]\s*/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim()
}

function parseMusicTitle(title: string): { title: string; artist: string } {
  const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (dashMatch) {
    const left = dashMatch[1].trim()
    const right = dashMatch[2].trim()
    const byMatch = right.match(/^(.+?)\s+by\s+(.+)$/i)
    if (byMatch) {
      return { artist: left, title: byMatch[1].trim() }
    }
    return { artist: left, title: right }
  }

  const byMatch = title.match(/^(.+?)\s+by\s+(.+)$/i)
  if (byMatch) {
    return { title: byMatch[1].trim(), artist: byMatch[2].trim() }
  }

  const quoteMatch = title.match(/["\u201C\u201D](.+?)["\u201C\u201D]\s*(?:by\s+)?(.+)?$/i)
  if (quoteMatch) {
    return { title: quoteMatch[1].trim(), artist: (quoteMatch[2] || '').trim() }
  }

  return { title, artist: '' }
}
