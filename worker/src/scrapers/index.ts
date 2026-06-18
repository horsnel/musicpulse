/**
 * Scraper Orchestrator
 *
 * Coordinates all scraping modules. Each scraper:
 *  - Fetches data from its source
 *  - Normalizes to MusicPulse schema
 *  - Writes to KV
 *
 * Scrapers that need API keys gracefully skip if the key is missing.
 * Per-scraper status (fulfilled / rejected / skipped) is captured in
 * `scrape:meta` so the frontend can surface data freshness issues.
 */

import { Env } from '../index'
import { scrapeSpotifyCharts } from './spotify-charts'
import { scrapeAppleRSS } from './apple-rss'
import { scrapeDeezer } from './deezer'
import { scrapeTikTok } from './tiktok'
import { scrapeYouTube } from './youtube'
import { scrapeLastfm } from './lastfm'
import { scrapeGenius } from './genius'
import { scrapeTheAudioDB } from './theaudiodb'
import { scrapeSetlistFm } from './setlistfm'
import { scrapeReddit } from './reddit'
import { scrapeITunes } from './itunes'
import { scrapeMusicBrainz } from './musicbrainz'
import { scrapeBandcamp } from './bandcamp'
import { scrapeAudiomack } from './audiomack'
import { scrapeMusixmatch } from './musixmatch'
import { scrapeIHeartRadio } from './iheartradio'
import { scrapeGenreCharts } from './genre-charts'
import { scrapeMelon } from './melon'
import { scrapeOricon } from './oricon'
import { scrapeSoundcloud } from './soundcloud'
import { scrapeBillboard } from './billboard'
import { scrapeArticles } from './articles'
import { scrapeEvents } from './events'
import { computeCrossPlatform } from '../normalizers/cross-platform'
import { computeVelocity } from '../normalizers/velocity'
import { computeHeatmap } from '../normalizers/heatmap'
import { computeAggregatedCharts } from '../normalizers/aggregated-charts'
import { computeSocialCharts } from '../normalizers/social-charts'
import { writeKVMeta } from '../store'
import { ScraperSkippedError } from './errors'

// Re-export for backward compatibility (other modules may import from ./index)
export { ScraperSkippedError }

interface ScraperDef {
  name: string
  fn: (env: Env) => Promise<void>
}

const ALL_SCRAPERS: ScraperDef[] = [
  // Charts (every 6 hours)
  { name: 'spotify-charts', fn: scrapeSpotifyCharts },
  { name: 'apple-rss',      fn: scrapeAppleRSS },
  { name: 'deezer',         fn: scrapeDeezer },
  { name: 'youtube',        fn: scrapeYouTube },

  // Trending (every 2 hours)
  { name: 'tiktok',         fn: scrapeTikTok },
  { name: 'reddit',         fn: scrapeReddit },      // Generates twitter trending data

  // New platforms (no key needed)
  { name: 'bandcamp',       fn: scrapeBandcamp },
  { name: 'audiomack',      fn: scrapeAudiomack },
  { name: 'iheartradio',    fn: scrapeIHeartRadio },
  { name: 'musixmatch',     fn: scrapeMusixmatch },
  { name: 'soundcloud',     fn: scrapeSoundcloud },
  { name: 'billboard',      fn: scrapeBillboard },

  // Enrichment (no key needed)
  { name: 'itunes',         fn: scrapeITunes },
  { name: 'musicbrainz',    fn: scrapeMusicBrainz },

  // Genre charts
  { name: 'genre-charts',   fn: scrapeGenreCharts },

  // Regional charts (no key needed)
  { name: 'melon',          fn: scrapeMelon },
  { name: 'oricon',         fn: scrapeOricon },

  // Artist/metadata enrichment (key-gated)
  { name: 'lastfm',         fn: scrapeLastfm },
  { name: 'theaudiodb',     fn: scrapeTheAudioDB },
  { name: 'genius',         fn: scrapeGenius },
  { name: 'setlistfm',      fn: scrapeSetlistFm },
]

/**
 * Run a list of scrapers in parallel and return structured per-scraper status.
 * Rejectures are captured (not thrown) so one bad scraper doesn't kill the run.
 */
async function runScrapersWithStatus(
  env: Env,
  scrapers: ScraperDef[],
): Promise<Array<{ name: string; status: 'fulfilled' | 'rejected'; error?: string; skipped?: boolean; skippedReason?: string }>> {
  const results = await Promise.allSettled(scrapers.map(s => s.fn(env)))

  return results.map((r, i) => {
    const name = scrapers[i].name
    if (r.status === 'fulfilled') {
      return { name, status: 'fulfilled' as const }
    }
    // Rejected — was it an intentional skip?
    const reason = r.reason
    if (reason instanceof ScraperSkippedError) {
      return {
        name,
        status: 'rejected' as const,
        skipped: true,
        skippedReason: reason.reason,
      }
    }
    return {
      name,
      status: 'rejected' as const,
      error: reason?.message || String(reason),
    }
  })
}

export async function scrapeAll(env: Env): Promise<void> {
  console.log('[scrape] Starting full scrape...')
  const start = Date.now()

  const sourceStatus = await runScrapersWithStatus(env, ALL_SCRAPERS)

  // Log failures for Cloudflare Worker logs
  sourceStatus.forEach(s => {
    if (s.status === 'rejected') {
      if (s.skipped) {
        console.warn(`[scrape] ${s.name} SKIPPED: ${s.skippedReason}`)
      } else {
        console.error(`[scrape] ${s.name} FAILED: ${s.error}`)
      }
    }
  })

  // Compute derived data from the raw scraped data
  await Promise.allSettled([
    computeCrossPlatform(env),
    computeVelocity(env),
    computeHeatmap(env),
    computeAggregatedCharts(env),
    computeSocialCharts(env),
  ])

  // Generate articles and events from trending data (depends on derived data)
  await Promise.allSettled([
    scrapeArticles(env),
    scrapeEvents(env),
  ])

  // Update scrape metadata — now includes per-source error/skip info
  const elapsed = Date.now() - start
  await writeKVMeta(env, 'scrape:meta', {
    lastRun: new Date().toISOString(),
    elapsedMs: elapsed,
    sources: sourceStatus,
  })

  console.log(`[scrape] Full scrape completed in ${elapsed}ms`)
}

export async function scrapeCharts(env: Env): Promise<void> {
  console.log('[scrape] Starting chart scrape...')
  const chartScrapers = ALL_SCRAPERS.filter(s =>
    ['spotify-charts', 'apple-rss', 'deezer', 'youtube', 'genre-charts', 'melon', 'oricon'].includes(s.name)
  )
  await runScrapersWithStatus(env, chartScrapers)
  console.log('[scrape] Chart scrape completed')
}

export async function scrapeTrending(env: Env): Promise<void> {
  console.log('[scrape] Starting trending scrape...')
  const trendingScrapers = ALL_SCRAPERS.filter(s =>
    ['tiktok', 'reddit', 'itunes', 'musicbrainz', 'lastfm', 'theaudiodb',
     'setlistfm', 'genius', 'bandcamp', 'audiomack', 'iheartradio',
     'musixmatch', 'soundcloud', 'billboard', 'melon', 'oricon'].includes(s.name)
  )
  await runScrapersWithStatus(env, trendingScrapers)

  // Recompute derived data
  await Promise.allSettled([
    computeCrossPlatform(env),
    computeVelocity(env),
    computeHeatmap(env),
    computeAggregatedCharts(env),
    computeSocialCharts(env),
  ])

  // Generate articles and events from trending data (depends on derived data)
  await Promise.allSettled([
    scrapeArticles(env),
    scrapeEvents(env),
  ])

  console.log('[scrape] Trending scrape completed')
}
