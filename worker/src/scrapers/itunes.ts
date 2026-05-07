/**
 * iTunes Search API Scraper
 *
 * Fetches top songs and new releases from the iTunes RSS feed.
 * No API key required — completely free.
 *
 * Provides:
 *  - Top songs (complements Apple Music RSS)
 *  - New releases / albums
 *  - Song metadata enrichment (preview URLs, track counts, etc.)
 *
 * RSS feeds: https://rss.applemarketingtools.com/api/v2/{country}/music/most-played/100/songs.json
 * Search API: https://itunes.apple.com/search?term=...&entity=song&limit=10
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify } from './helpers'

interface iTunesTrack {
  trackId: number
  trackName: string
  artistId: number
  artistName: string
  collectionId: number
  collectionName: string
  artworkUrl100: string
  releaseDate: string
  primaryGenreName: string
  trackTimeMillis: number
  trackViewUrl: string
  previewUrl: string
  isStreamable: boolean
}

interface iTunesSearchResponse {
  resultCount: number
  results: iTunesTrack[]
}

export async function scrapeITunes(env: Env): Promise<void> {
  console.log('[itunes] Starting...')

  try {
    // Fetch new releases by searching for recent popular terms
    const searchTerms = [
      'new music 2026', 'top hits 2026', 'afrobeats 2026', 'kpop 2026',
      'new releases may 2026', 'latin music 2026', 'indie 2026',
    ]
    const allTracks: iTunesTrack[] = []
    const seenIds = new Set<number>()

    for (const term of searchTerms) {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15&country=us`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
        })

        if (!res.ok) {
          console.warn(`[itunes] Search "${term}" HTTP ${res.status}`)
          continue
        }

        const data = await res.json() as iTunesSearchResponse
        for (const track of data.results || []) {
          if (!seenIds.has(track.trackId)) {
            seenIds.add(track.trackId)
            allTracks.push(track)
          }
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`[itunes] Search "${term}" error:`, err)
      }
    }

    // Also fetch from iTunes RSS feeds for new releases
    try {
      const rssUrl = 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/200/songs.json'
      const rssRes = await fetch(rssUrl, {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      })
      if (rssRes.ok) {
        const rssData = await rssRes.json() as any
        const feed = rssData?.feed?.results ?? []
        for (const item of feed) {
          const trackId = item.id
          if (trackId && !seenIds.has(Number(trackId))) {
            seenIds.add(Number(trackId))
            allTracks.push({
              trackId: Number(trackId),
              trackName: item.name || '',
              artistId: Number(item.artistId) || 0,
              artistName: item.artistName || '',
              collectionId: Number(item.collectionId) || 0,
              collectionName: item.collectionName || '',
              artworkUrl100: item.artworkUrl100?.replace('100x100', '600x600') || '',
              releaseDate: item.releaseDate || '',
              primaryGenreName: item.genres?.[0]?.name || '',
              trackTimeMillis: item.durationInMillis || 0,
              trackViewUrl: item.url || '',
              previewUrl: '',
              isStreamable: true,
            })
          }
        }
      }
    } catch (err) {
      console.error('[itunes] RSS feed error:', err)
    }

    // Generate new releases from iTunes data
    if (allTracks.length > 0) {
      // Deduplicate by collection (album) and group tracks
      const albumMap = new Map<number, { track: iTunesTrack; trackCount: number; tracks: iTunesTrack[] }>()
      for (const track of allTracks) {
        if (track.collectionId) {
          const existing = albumMap.get(track.collectionId)
          if (existing) {
            existing.trackCount++
            existing.tracks.push(track)
          } else {
            albumMap.set(track.collectionId, { track, trackCount: 1, tracks: [track] })
          }
        }
      }

      const newReleases = Array.from(albumMap.values())
        .sort((a, b) => new Date(b.track.releaseDate).getTime() - new Date(a.track.releaseDate).getTime())
        .slice(0, 30)
        .map(({ track, trackCount }, i) => {
          // Determine release type based on track count
          let type: 'album' | 'ep' | 'single' = 'album'
          if (trackCount === 1) type = 'single'
          else if (trackCount <= 6) type = 'ep'

          return {
            id: `itunes-album-${i}`,
            slug: slugify(track.collectionName + '-' + track.artistName),
            title: track.collectionName,
            artistId: `itunes:${track.artistId}`,
            artistName: track.artistName,
            releaseDate: track.releaseDate?.split('T')[0] || '',
            type,
            trackCount,
            coverUrl: track.artworkUrl100?.replace('100x100', '600x600'),
            isLatest: i === 0,
            label: track.primaryGenreName || '',
          }
        })

      await writeKV(env, 'albums:new', newReleases)
      console.log(`[itunes] ${newReleases.length} new releases written`)

      // Also use iTunes to enrich trending data with album covers
      // Check for missing album covers in trending data
      const allTrendingPlatforms = ['spotify', 'apple', 'youtube', 'tiktok', 'twitter', 'deezer', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon', 'soundcloud', 'billboard']
      for (const platform of allTrendingPlatforms) {
        const trendingData = await readKV<any>(env, `trending:${platform}`)
        if (!trendingData?.items) continue

        let enriched = false
        const missingArtItems: any[] = []

        for (const item of trendingData.items) {
          if (!item.albumCoverUrl && item.songTitle && item.artistName) {
            // First try matching from the tracks we already fetched
            const match = allTracks.find(t =>
              t.trackName.toLowerCase().includes(item.songTitle.toLowerCase().substring(0, 10)) &&
              t.artistName.toLowerCase().includes(item.artistName.toLowerCase().substring(0, 8))
            )
            if (match?.artworkUrl100) {
              item.albumCoverUrl = match.artworkUrl100.replace('100x100', '600x600')
              enriched = true
            } else {
              missingArtItems.push(item)
            }
          }
        }

        // For remaining items, do targeted iTunes searches
        if (missingArtItems.length > 0) {
          const searchTerms = missingArtItems.slice(0, 5).map(item =>
            `${item.songTitle} ${item.artistName}`
          )

          for (const term of searchTerms) {
            try {
              const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1&country=us`
              const res = await fetch(url, {
                headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
              })
              if (!res.ok) continue
              const data = await res.json() as iTunesSearchResponse
              if (data.results?.[0]?.artworkUrl100) {
                const artworkUrl = data.results[0].artworkUrl100.replace('100x100', '600x600')
                // Find the matching item and set its cover
                const searchResult = data.results[0]
                for (const item of missingArtItems) {
                  if (
                    !item.albumCoverUrl &&
                    (item.songTitle.toLowerCase().includes(searchResult.trackName.toLowerCase().substring(0, 8)) ||
                     searchResult.trackName.toLowerCase().includes(item.songTitle.toLowerCase().substring(0, 8)))
                  ) {
                    item.albumCoverUrl = artworkUrl
                    enriched = true
                  }
                }
              }
              await new Promise(r => setTimeout(r, 200))
            } catch {
              // Ignore search errors
            }
          }
        }

        if (enriched) {
          await writeKV(env, `trending:${platform}`, trendingData.items)
        }
      }
    }

    console.log(`[itunes] ${allTracks.length} tracks processed`)

  } catch (err) {
    console.error('[itunes] error:', err)
  }
}
