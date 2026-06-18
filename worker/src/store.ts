/**
 * KV Store Helpers
 *
 * Simple read/write wrappers for Cloudflare KV.
 * Data is stored as JSON with an updatedAt timestamp.
 *
 * Song persistence
 * ----------------
 * Trending data changes every 2–6 hours — songs fall out of the chart and
 * their detail pages start 404ing. To prevent this, writeKV() auto-persists
 * every song under `songs:<slug>` whenever it writes to a `trending:*` key.
 * lookupSong() then checks `songs:<slug>` first before scanning live
 * trending/charts data.
 */

import { Env } from './index'
import { slugify, normalizeSlugForLookup } from './scrapers/helpers'

interface KVData<T> {
  items: T[]
  updatedAt: string
}

export async function writeKV<T>(env: Env, key: string, items: T[]): Promise<void> {
  const updatedAt = new Date().toISOString()
  const data: KVData<T> = { items, updatedAt }
  await env.DATA.put(key, JSON.stringify(data))

  // Auto-persist songs whenever a trending:* key is written.
  // This means every trending scraper implicitly populates the songs:<slug>
  // store without each scraper needing to call persistSongs() explicitly.
  if (key.startsWith('trending:')) {
    const platform = key.replace('trending:', '')
    try {
      await persistSongs(env, items as any[], platform, updatedAt)
    } catch (err) {
      // Persistence is best-effort — never let it break a scrape run.
      console.error(`[store] persistSongs failed for ${key}:`, err)
    }
  }
}

export async function writeKVMeta(env: Env, key: string, meta: any): Promise<void> {
  await env.DATA.put(key, JSON.stringify({
    ...meta,
    updatedAt: new Date().toISOString(),
  }))
}

export async function readKV<T>(env: Env, key: string): Promise<KVData<T> | null> {
  const raw = await env.DATA.get(key, 'json')
  if (!raw) return null
  return raw as KVData<T>
}

// ─── Song persistence ─────────────────────────────────────────

interface PersistedSong {
  slug: string
  title: string
  artistName: string
  artistSlug: string
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
  songId?: string
  firstSeen: string
  lastSeen: string
  // Per-platform snapshot of the most recent observation
  platforms: Record<string, {
    rank?: number
    metric?: number
    metricUnit?: string
    badge?: string | null
    surgePercent?: number | null
    lastSeen: string
  }>
}

/**
 * Persist each unique song in a trending list under `songs:<slug>`.
 * If the song was already persisted, merge — update lastSeen, refresh the
 * platform snapshot, but keep firstSeen and any prior platform observations.
 */
async function persistSongs(
  env: Env,
  items: any[],
  platform: string,
  now: string,
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return

  // Batch reads — get all current persisted songs for these slugs in one go
  const slugMap = new Map<string, any>()
  for (const item of items) {
    if (!item?.songTitle && !item?.artistName) continue
    const slug = slugify(`${item.songTitle}-${item.artistName}`)
    if (!slug) continue
    slugMap.set(slug, item)
  }
  if (slugMap.size === 0) return

  // KV doesn't batch — but writes can be parallelized.
  const writes: Promise<void>[] = []

  for (const [slug, item] of slugMap) {
    const key = `songs:${slug}`
    writes.push((async () => {
      try {
        const existing = await env.DATA.get(key, 'json') as PersistedSong | null
        const platformSnapshot = {
          rank: item.rank,
          metric: item.metric,
          metricUnit: item.metricUnit,
          badge: item.badge ?? null,
          surgePercent: item.surgePercent ?? null,
          lastSeen: now,
        }

        const merged: PersistedSong = existing
          ? {
              ...existing,
              title: item.songTitle || existing.title,
              artistName: item.artistName || existing.artistName,
              artistSlug: item.artistSlug || slugify(item.artistName || '') || existing.artistSlug,
              albumCoverUrl: item.albumCoverUrl || existing.albumCoverUrl,
              artEmoji: item.artEmoji || existing.artEmoji,
              artGradient: item.artGradient || existing.artGradient,
              songId: item.songId || existing.songId,
              lastSeen: now,
              platforms: {
                ...existing.platforms,
                [platform]: platformSnapshot,
              },
            }
          : {
              slug,
              title: item.songTitle || '',
              artistName: item.artistName || '',
              artistSlug: slugify(item.artistName || ''),
              albumCoverUrl: item.albumCoverUrl || '',
              artEmoji: item.artEmoji || '',
              artGradient: item.artGradient || '',
              songId: item.songId || '',
              firstSeen: now,
              lastSeen: now,
              platforms: { [platform]: platformSnapshot },
            }

        await env.DATA.put(key, JSON.stringify(merged))
      } catch (err) {
        // Don't let one bad song kill the whole batch
        console.error(`[store] failed to persist ${key}:`, err)
      }
    })())
  }

  await Promise.allSettled(writes)
}

/**
 * Read a persisted song by slug. Returns null if not found.
 * Tries the exact slug first, then a normalized lookup against known songs
 * (slower — only used as a fallback).
 */
export async function readPersistedSong(
  env: Env,
  slug: string,
): Promise<{ payload: any; updatedAt: string } | null> {
  // 1. Exact slug
  const exact = await env.DATA.get(`songs:${slug}`, 'json') as PersistedSong | null
  if (exact) {
    return { payload: songToTrendingItem(exact), updatedAt: exact.lastSeen }
  }

  // 2. Normalized slug match — scan songs:* keys (KV list + match)
  // KV.list is paginated; we limit to first 500 keys to keep latency bounded.
  // This handles cases like "José" → "jose" where the URL slug is stale.
  const targetNorm = normalizeSlugForLookup(slug)
  if (!targetNorm) return null

  try {
    const listed = await env.DATA.list({ prefix: 'songs:', limit: 500 })
    for (const k of listed.keys) {
      const keySlug = k.name.replace('songs:', '')
      if (normalizeSlugForLookup(keySlug) === targetNorm) {
        const match = await env.DATA.get(k.name, 'json') as PersistedSong | null
        if (match) {
          return { payload: songToTrendingItem(match), updatedAt: match.lastSeen }
        }
      }
    }
  } catch (err) {
    console.error('[store] readPersistedSong fallback scan failed:', err)
  }

  return null
}

/**
 * Convert a PersistedSong back into a TrendingItem-shaped object that the
 * frontend's SongDetailClient can render. Uses the most recent platform
 * snapshot (by lastSeen).
 */
function songToTrendingItem(song: PersistedSong): any {
  // Pick the platform snapshot with the latest lastSeen
  let bestPlatform: { name: string; snap: any } | null = null
  for (const [name, snap] of Object.entries(song.platforms)) {
    if (!bestPlatform || snap.lastSeen > bestPlatform.snap.lastSeen) {
      bestPlatform = { name, snap }
    }
  }
  const platform = bestPlatform?.name ?? 'spotify'
  const snap = bestPlatform?.snap ?? {}

  return {
    id: `songs:${song.slug}`,
    rank: snap.rank ?? 0,
    rankChange: 0,
    isNew: false,
    platform,
    songId: song.songId || '',
    songTitle: song.title,
    artistName: song.artistName,
    albumCoverUrl: song.albumCoverUrl || '',
    artEmoji: song.artEmoji || '\u{1F3B5}',
    artGradient: song.artGradient || '',
    metric: snap.metric ?? 0,
    metricUnit: snap.metricUnit ?? 'streams',
    badge: snap.badge ?? null,
    surgePercent: snap.surgePercent ?? null,
    // Helpful extras for the UI:
    lastSeen: song.lastSeen,
    firstSeen: song.firstSeen,
    persistedAcross: Object.keys(song.platforms),
  }
}
