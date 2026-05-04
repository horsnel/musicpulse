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
import { scrapeSetlistFm } from './setlistfm'
import { scrapeReddit } from './reddit'
import { scrapeITunes } from './itunes'
import { scrapeMusicBrainz } from './musicbrainz'
import { scrapeBandcamp } from './bandcamp'
import { scrapeAudiomack } from './audiomack'
import { scrapeMusixmatch } from './musixmatch'
import { scrapeIHeartRadio } from './iheartradio'
import { computeCrossPlatform } from '../normalizers/cross-platform'
import { computeVelocity } from '../normalizers/velocity'
import { computeHeatmap } from '../normalizers/heatmap'
import { writeKVMeta } from '../store'

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
    scrapeReddit(env),      // Generates twitter trending data

    // New platforms (no key needed)
    scrapeBandcamp(env),
    scrapeAudiomack(env),
    scrapeIHeartRadio(env),
    scrapeMusixmatch(env),

    // Enrichment (no key needed)
    scrapeITunes(env),
    scrapeMusicBrainz(env),

    // Artist/metadata enrichment (key-gated)
    scrapeLastfm(env),
    scrapeTheAudioDB(env),
    scrapeGenius(env),
    scrapeSetlistFm(env),
  ])

  // Log results
  const names = [
    'spotify-charts', 'apple-rss', 'deezer', 'youtube',
    'tiktok', 'reddit',
    'bandcamp', 'audiomack', 'iheartradio', 'musixmatch',
    'itunes', 'musicbrainz',
    'lastfm', 'theaudiodb', 'genius', 'setlistfm',
  ]
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
  await writeKVMeta(env, 'scrape:meta', {
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
    scrapeReddit(env),
    scrapeITunes(env),
    scrapeMusicBrainz(env),
    scrapeLastfm(env),
    scrapeTheAudioDB(env),
    scrapeSetlistFm(env),
    scrapeGenius(env),
    scrapeBandcamp(env),
    scrapeAudiomack(env),
    scrapeIHeartRadio(env),
    scrapeMusixmatch(env),
  ])

  // Recompute derived data
  await Promise.allSettled([
    computeCrossPlatform(env),
    computeVelocity(env),
    computeHeatmap(env),
  ])
  console.log('[scrape] Trending scrape completed')
}
