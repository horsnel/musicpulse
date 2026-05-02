/**
 * Scraper Orchestrator
 *
 * Coordinates all scraping modules. Each scraper:
 *  - Fetches data from its source
 *  - Normalizes to MusicPulse schema
 *  - Writes to KV
 *
 * Scrapers that need API keys gracefully skip if the key is missing.
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
import { computeCrossPlatform } from '../normalizers/cross-platform'
import { computeVelocity } from '../normalizers/velocity'
import { computeHeatmap } from '../normalizers/heatmap'
import { writeKV } from '../store'

export async function scrapeAll(env: Env): Promise<void> {
  console.log('[scrape] Starting full scrape...')
  const start = Date.now()

  const results = await Promise.allSettled([
    // Charts (every 6 hours)
    scrapeSpotifyCharts(env),
    scrapeAppleRSS(env),
    scrapeDeezer(env),
    scrapeYouTube(env),

    // Trending (every 2 hours)
    scrapeTikTok(env),

    // Artist/metadata enrichment
    scrapeLastfm(env),
    scrapeTheAudioDB(env),
    scrapeGenius(env),
  ])

  // Log results
  const names = ['spotify-charts', 'apple-rss', 'deezer', 'youtube', 'tiktok', 'lastfm', 'theaudiodb', 'genius']
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[scrape] ${names[i]} failed:`, r.reason)
  })

  // Compute derived data from the raw scraped data
  await Promise.allSettled([
    computeCrossPlatform(env),
    computeVelocity(env),
    computeHeatmap(env),
  ])

  // Update scrape metadata
  const elapsed = Date.now() - start
  await writeKV(env, 'scrape:meta', {
    lastRun: new Date().toISOString(),
    elapsedMs: elapsed,
    sources: names.map((name, i) => ({
      name,
      status: results[i].status,
    })),
  })

  console.log(`[scrape] Full scrape completed in ${elapsed}ms`)
}

export async function scrapeCharts(env: Env): Promise<void> {
  console.log('[scrape] Starting chart scrape...')
  await Promise.allSettled([
    scrapeSpotifyCharts(env),
    scrapeAppleRSS(env),
    scrapeDeezer(env),
    scrapeYouTube(env),
  ])
  console.log('[scrape] Chart scrape completed')
}

export async function scrapeTrending(env: Env): Promise<void> {
  console.log('[scrape] Starting trending scrape...')
  await Promise.allSettled([
    scrapeTikTok(env),
    scrapeLastfm(env),
    scrapeTheAudioDB(env),
  ])

  // Recompute derived data
  await Promise.allSettled([
    computeCrossPlatform(env),
    computeVelocity(env),
    computeHeatmap(env),
  ])
  console.log('[scrape] Trending scrape completed')
}
