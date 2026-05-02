/**
 * charts-scraper.worker.ts
 *
 * Cloudflare Worker with a Cron Trigger — runs every hour.
 * Fetches Spotify Charts CSV + Apple Music RSS, diffs against D1,
 * writes new entries, and invalidates the KV cache for chart pages.
 *
 * Deploy: wrangler deploy --config wrangler.workers.toml
 */

export interface Env {
  DB:    D1Database
  CACHE: KVNamespace
}

export default {
  // ── HTTP handler (health check) ────────────────────────────────
  async fetch(_req: Request, _env: Env): Promise<Response> {
    return new Response('MusicPulse Workers — OK', { status: 200 })
  },

  // ── Cron trigger ───────────────────────────────────────────────
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await Promise.allSettled([
      scrapeSpotifyCharts(env),
      scrapeAppleMusicCharts(env),
    ])
  },
}

// ─── SPOTIFY CHARTS ────────────────────────────────────────────
async function scrapeSpotifyCharts(env: Env) {
  const REGIONS = [
    { id: 'global', url: 'https://charts.spotify.com/charts/overview/global' },
    { id: 'ng',     url: 'https://charts.spotify.com/charts/overview/ng' },
    { id: 'us',     url: 'https://charts.spotify.com/charts/overview/us' },
  ]

  for (const region of REGIONS) {
    try {
      // Spotify publishes the chart data as a public JSON endpoint
      const res = await fetch(
        `https://charts.spotify.com/charts/view/regional-${region.id}-daily/latest.json`,
        { headers: { 'User-Agent': 'MusicPulse/1.0 (musicpulse.com)' } },
      )
      if (!res.ok) continue

      const data: SpotifyChartResponse = await res.json()
      const entries = data.entries ?? []

      for (const entry of entries.slice(0, 200)) {
        const existing = await env.DB
          .prepare('SELECT id FROM chart_entries WHERE song_id = ? AND platform = ? AND region = ? AND chart_date = date("now")')
          .bind(entry.trackMetadata.trackUri, 'spotify', region.id)
          .first()

        if (existing) continue  // already written today

        await env.DB
          .prepare(`
            INSERT OR REPLACE INTO chart_entries
              (id, song_id, platform, region, position, streams, chart_date, peak_position, weeks_on_chart)
            VALUES (?, ?, ?, ?, ?, ?, date("now"), ?, ?)
          `)
          .bind(
            crypto.randomUUID(),
            entry.trackMetadata.trackUri,
            'spotify',
            region.id,
            entry.chartEntryData.currentRank,
            entry.chartEntryData.ranksOnChart,  // used as proxy for streams
            entry.chartEntryData.peakRank,
            entry.chartEntryData.weeksOnChart,
          )
          .run()
      }

      // Invalidate KV cache so ISR pages pick up fresh data
      await env.CACHE.delete(`chart:spotify:${region.id}`)
      console.log(`[spotify] ${region.id} — ${entries.length} entries written`)

    } catch (err) {
      console.error(`[spotify] ${region.id} error:`, err)
    }
  }
}

// ─── APPLE MUSIC RSS ───────────────────────────────────────────
async function scrapeAppleMusicCharts(env: Env) {
  // Apple publishes free RSS feeds — no auth needed
  const FEEDS = [
    { id: 'global', url: 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/100/songs.json' },
    { id: 'ng',     url: 'https://rss.applemarketingtools.com/api/v2/ng/music/most-played/100/songs.json' },
  ]

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url)
      if (!res.ok) continue

      const data: AppleRSSResponse = await res.json()
      const results = data.feed?.results ?? []

      for (let i = 0; i < results.length; i++) {
        const track = results[i]
        const existing = await env.DB
          .prepare('SELECT id FROM chart_entries WHERE song_id = ? AND platform = ? AND region = ? AND chart_date = date("now")')
          .bind(track.id, 'apple', feed.id)
          .first()

        if (existing) continue

        // Upsert artist first
        await env.DB
          .prepare('INSERT OR IGNORE INTO artists (id, name, slug) VALUES (?, ?, ?)')
          .bind(track.artistId, track.artistName, slugify(track.artistName))
          .run()

        // Upsert song
        await env.DB
          .prepare('INSERT OR IGNORE INTO songs (id, title, artist_id, cover_url, slug) VALUES (?, ?, ?, ?, ?)')
          .bind(track.id, track.name, track.artistId, track.artworkUrl100, slugify(track.name + '-' + track.artistName))
          .run()

        // Chart entry
        await env.DB
          .prepare(`INSERT OR REPLACE INTO chart_entries (id, song_id, platform, region, position, chart_date, peak_position, weeks_on_chart)
                    VALUES (?, ?, ?, ?, ?, date("now"), ?, 1)`)
          .bind(crypto.randomUUID(), track.id, 'apple', feed.id, i + 1, i + 1)
          .run()
      }

      await env.CACHE.delete(`chart:apple:${feed.id}`)
      console.log(`[apple] ${feed.id} — ${results.length} entries written`)

    } catch (err) {
      console.error(`[apple] ${feed.id} error:`, err)
    }
  }
}

// ─── HELPERS ───────────────────────────────────────────────────
function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

// ─── TYPES ─────────────────────────────────────────────────────
interface SpotifyChartResponse {
  entries: Array<{
    trackMetadata: { trackUri: string; trackName: string; artistName: string; images: Array<{ url: string }> }
    chartEntryData: { currentRank: number; previousRank: number; peakRank: number; weeksOnChart: number; ranksOnChart: number }
  }>
}

interface AppleRSSResponse {
  feed: {
    results: Array<{
      id: string; name: string; artistId: string; artistName: string;
      artworkUrl100: string; releaseDate: string; genreNames: string[]
    }>
  }
}
