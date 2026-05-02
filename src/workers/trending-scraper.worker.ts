/**
 * trending-scraper.worker.ts
 *
 * Cron: every 2 hours
 * Scrapes TikTok Creative Center trending sounds + Nitter Twitter music hashtags
 * Writes to D1 trending table, invalidates KV cache
 */

export interface Env {
  DB:           D1Database
  CACHE:        KVNamespace
  LASTFM_API_KEY: string
}

export default {
  async fetch(_req: Request, _env: Env): Promise<Response> {
    return new Response('trending-scraper — OK')
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await Promise.allSettled([
      scrapeTikTokTrending(env),
      scrapeTwitterTrending(env),
      scrapeYouTubeTrending(env),
    ])
  },
}

// ─── TIKTOK ────────────────────────────────────────────────────
async function scrapeTikTokTrending(env: Env) {
  /**
   * TikTok Creative Center publishes trending sounds at:
   * https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en
   *
   * The page loads via XHR — we call the underlying API directly.
   * No auth required for the public creative center endpoint.
   */
  try {
    const res = await fetch(
      'https://ads.tiktok.com/creative_radar_api/v1/popular_trend/music/list?period=7&page=1&limit=20&country_code=US',
      {
        headers: {
          'User-Agent': 'MusicPulse/1.0',
          'Accept': 'application/json',
        },
      },
    )
    if (!res.ok) throw new Error(`TikTok API ${res.status}`)

    const data: TikTokResponse = await res.json()
    const sounds = data.data?.music_list ?? []

    // Wipe today's TikTok entries before re-inserting
    await env.DB.prepare("DELETE FROM trending WHERE platform = 'tiktok' AND date(fetched_at) = date('now')").run()

    for (let i = 0; i < sounds.length; i++) {
      const s = sounds[i]

      // Try to resolve to a song in our DB via Last.fm search
      const songId = await resolveToSongId(s.title, s.author, env.LASTFM_API_KEY)

      await env.DB
        .prepare(`INSERT INTO trending (id, song_id, platform, score, usage_count, fetched_at)
                  VALUES (?, ?, 'tiktok', ?, ?, datetime('now'))`)
        .bind(crypto.randomUUID(), songId ?? s.id, (sounds.length - i) / sounds.length, s.use_cnt)
        .run()
    }

    await env.CACHE.delete('trending:tiktok')
    console.log(`[tiktok] ${sounds.length} trending sounds written`)
  } catch (err) {
    console.error('[tiktok] error:', err)
  }
}

// ─── TWITTER / NITTER ──────────────────────────────────────────
async function scrapeTwitterTrending(env: Env) {
  /**
   * Nitter is an open-source Twitter frontend — no API key required.
   * We fetch the trending page and parse music-related hashtags.
   * Public instance list: https://github.com/zedeus/nitter/wiki/Instances
   */
  const NITTER_INSTANCE = 'https://nitter.privacydev.net'
  const MUSIC_KEYWORDS  = ['music', 'song', 'album', 'artist', 'rapper', 'singer', 'afrobeats', 'kpop', 'hiphop', 'rnb', 'chart', 'spotify', 'newmusic']

  try {
    const res = await fetch(`${NITTER_INSTANCE}/search/trending`, {
      headers: { 'User-Agent': 'MusicPulse/1.0' },
    })
    if (!res.ok) throw new Error(`Nitter ${res.status}`)

    const html = await res.text()

    // Simple regex extraction — replace with a proper HTML parser in production
    const trendMatches = [...html.matchAll(/href="\/search\?q=%23([^"]+)"[^>]*>.*?trend-count[^>]*>([\d,.KM]+)/g)]

    const musicTrends = trendMatches
      .map(m => ({ tag: decodeURIComponent(m[1]), countRaw: m[2] }))
      .filter(t => MUSIC_KEYWORDS.some(kw => t.tag.toLowerCase().includes(kw)))
      .slice(0, 20)

    await env.DB.prepare("DELETE FROM trending WHERE platform = 'twitter' AND date(fetched_at) = date('now')").run()

    for (let i = 0; i < musicTrends.length; i++) {
      const t = musicTrends[i]
      await env.DB
        .prepare(`INSERT INTO trending (id, song_id, platform, score, usage_count, fetched_at)
                  VALUES (?, ?, 'twitter', ?, ?, datetime('now'))`)
        .bind(crypto.randomUUID(), `hashtag:${t.tag}`, (musicTrends.length - i) / musicTrends.length, parseCount(t.countRaw))
        .run()
    }

    await env.CACHE.delete('trending:twitter')
    console.log(`[twitter] ${musicTrends.length} music trends written`)
  } catch (err) {
    console.error('[twitter] error:', err)
  }
}

// ─── YOUTUBE MUSIC CHARTS ──────────────────────────────────────
async function scrapeYouTubeTrending(env: Env) {
  /**
   * charts.youtube.com is a public page. The underlying data is available
   * via the YouTube Data API (free tier: 10,000 units/day).
   * We use the videoCategoryId=10 (Music) filter on the trending videos endpoint.
   */
  const YOUTUBE_API_KEY = '' // Add via env in production

  try {
    if (!YOUTUBE_API_KEY) {
      // Fallback: scrape charts.youtube.com HTML
      const res = await fetch('https://charts.youtube.com/charts/TopSongs/global/daily', {
        headers: { 'User-Agent': 'MusicPulse/1.0' },
      })
      if (!res.ok) throw new Error(`YouTube charts ${res.status}`)
      // HTML parsing would go here — placeholder for now
      console.log('[youtube] HTML scrape mode — parser not yet implemented')
      return
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`YouTube API ${res.status}`)

    const data = await res.json()
    const items = data.items ?? []

    await env.DB.prepare("DELETE FROM trending WHERE platform = 'youtube' AND date(fetched_at) = date('now')").run()

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await env.DB
        .prepare(`INSERT INTO trending (id, song_id, platform, score, usage_count, fetched_at)
                  VALUES (?, ?, 'youtube', ?, ?, datetime('now'))`)
        .bind(
          crypto.randomUUID(),
          item.id,
          (items.length - i) / items.length,
          parseInt(item.statistics?.viewCount ?? '0'),
        )
        .run()
    }

    await env.CACHE.delete('trending:youtube')
    console.log(`[youtube] ${items.length} trending videos written`)
  } catch (err) {
    console.error('[youtube] error:', err)
  }
}

// ─── LAST.FM SONG RESOLUTION ───────────────────────────────────
async function resolveToSongId(title: string, artist: string, apiKey: string): Promise<string | null> {
  if (!apiKey) return null
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json&limit=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const match = data?.results?.trackmatches?.track?.[0]
    return match ? `lastfm:${match.mbid || match.name}` : null
  } catch {
    return null
  }
}

// ─── HELPERS ───────────────────────────────────────────────────
function parseCount(raw: string): number {
  const s = raw.replace(/,/g, '').trim()
  if (s.endsWith('M')) return parseFloat(s) * 1_000_000
  if (s.endsWith('K')) return parseFloat(s) * 1_000
  return parseInt(s) || 0
}

// ─── TYPES ─────────────────────────────────────────────────────
interface TikTokResponse {
  data: {
    music_list: Array<{
      id: string
      title: string
      author: string
      use_cnt: number
      rank: number
    }>
  }
}
