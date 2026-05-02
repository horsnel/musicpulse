/**
 * MusicPulse API Worker
 *
 * Cloudflare Worker that:
 *  1. Scrapes music data from free + key-gated sources on a cron schedule
 *  2. Stores normalized data in KV as JSON blobs
 *  3. Serves API endpoints for the MusicPulse frontend to consume
 *
 * Deploy: cd worker && wrangler deploy
 */

import { scrapeAll, scrapeCharts, scrapeTrending } from './scrapers'
import { handleApi } from './router'

export interface Env {
  DATA: KVNamespace

  // API keys (optional — scrapers skip gracefully if missing)
  YOUTUBE_API_KEY?: string
  LASTFM_API_KEY?: string
  GENIUS_API_KEY?: string
  THEAUDIODB_API_KEY?: string
  SETLISTFM_API_KEY?: string
  MUSIXMATCH_API_KEY?: string
  SPOTIFY_CLIENT_ID?: string
  SPOTIFY_CLIENT_SECRET?: string
  SCRAPE_SECRET?: string
  ENVIRONMENT?: string
}

export default {
  // ── HTTP handler ────────────────────────────────────────────────
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)

    // Health check
    if (url.pathname === '/') {
      return Response.json({ status: 'ok', service: 'musicpulse-api', version: '1.0.0' })
    }

    // Manual scrape trigger (POST /api/scrape with Authorization header)
    if (url.pathname === '/api/scrape' && req.method === 'POST') {
      const auth = req.headers.get('authorization')?.replace('Bearer ', '')
      if (env.SCRAPE_SECRET && auth !== env.SCRAPE_SECRET) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const mode = url.searchParams.get('mode') ?? 'all' // 'all' | 'charts' | 'trending'
      ctx.waitUntil(
        mode === 'charts' ? scrapeCharts(env) :
        mode === 'trending' ? scrapeTrending(env) :
        scrapeAll(env)
      )
      return Response.json({ triggered: true, mode })
    }

    // API endpoints
    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, env)
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  },

  // ── Cron handler ────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Determine which scrapes to run based on the cron schedule
    // Every 2 hours: trending data
    // Every 6 hours: chart data
    const now = new Date(event.scheduledTime)
    const hour = now.getUTCHours()

    const isChartHour = hour % 6 === 0 // 0, 6, 12, 18 UTC

    if (isChartHour) {
      ctx.waitUntil(scrapeAll(env))
    } else {
      ctx.waitUntil(scrapeTrending(env))
    }
  },
}
