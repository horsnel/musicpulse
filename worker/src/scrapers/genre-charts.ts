import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

const ITUNES_RSS_BASE = 'https://itunes.apple.com'

const GENRE_MAP: Record<string, string> = {
  'Pop': 'pop',
  'Hip-Hop/Rap': 'hip-hop-rap',
  'R&B/Soul': 'r-b-soul',
  'Dance': 'dance',
  'Rock': 'rock',
  'Alternative': 'alternative',
  'Country': 'country',
  'Latino': 'latin',
  'Electronic': 'electronic',
  'K-Pop': 'k-pop',
  'Singer/Songwriter': 'singer-songwriter',
  'Afrobeats': 'afrobeats',
  'Indian': 'indian',
  'Jazz': 'jazz',
  'Classical': 'classical',
  'Christian & Gospel': 'gospel',
  'Reggae': 'reggae',
  'World': 'world',
}

const GENRE_COLORS: Record<string, string> = {
  'pop': '#FF6B9D',
  'hip-hop-rap': '#8B5CF6',
  'r-b-soul': '#EC4899',
  'dance': '#06B6D4',
  'rock': '#6B7280',
  'alternative': '#10B981',
  'country': '#D97706',
  'latin': '#F59E0B',
  'electronic': '#3B82F6',
  'k-pop': '#A855F7',
  'singer-songwriter': '#6366F1',
  'afrobeats': '#EF4444',
  'indian': '#F97316',
  'jazz': '#14B8A6',
  'classical': '#818CF8',
  'gospel': '#FB923C',
  'reggae': '#22C55E',
  'world': '#0EA5E9',
}

export async function scrapeGenreCharts(env: Env): Promise<void> {
  console.log('[genre-charts] Starting...')
  
  try {
    const url = `${ITUNES_RSS_BASE}/us/rss/topsongs/limit=200/json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      redirect: 'follow',
    })

    if (!res.ok) {
      console.warn(`[genre-charts] HTTP ${res.status}`)
      return
    }

    const data = await res.json() as any
    const entries = data?.feed?.entry ?? []

    // Group by genre
    const genreBuckets: Record<string, any[]> = {}
    
    for (const entry of entries) {
      const genreName = entry?.category?.attributes?.label || 'Other'
      const genreSlug = GENRE_MAP[genreName] || slugify(genreName)
      
      if (!genreBuckets[genreSlug]) {
        genreBuckets[genreSlug] = []
      }
      
      const images = entry?.['im:image'] || []
      const largestImage = images.length > 0 ? images[images.length - 1]?.label : ''
      const artworkUrl = largestImage ? largestImage.replace(/\d+x\d+bb\.\w+$/, '600x600bb.jpg') : ''
      const title = entry?.['im:name']?.label || 'Unknown'
      const artist = entry?.['im:artist']?.label || 'Unknown'
      const songUrl = entry?.link?.attributes?.href || ''
      
      genreBuckets[genreSlug].push({
        id: `genre-${genreSlug}-${genreBuckets[genreSlug].length}`,
        songId: entry?.id?.label || slugify(title),
        song: {
          id: entry?.id?.label || slugify(title),
          slug: slugify(title + '-' + artist),
          title,
          artistName: artist,
          artistSlug: slugify(artist),
          albumCoverUrl: artworkUrl,
          durationMs: 0,
          releaseDate: '',
          genres: [genreName],
          popularityScore: Math.max(0, 100 - genreBuckets[genreSlug].length),
        },
        platform: 'apple' as const,
        region: 'global' as any,
        position: genreBuckets[genreSlug].length + 1,
        positionChange: 0,
        isNewEntry: false,
        isReEntry: false,
        streams: undefined,
        peakPosition: genreBuckets[genreSlug].length + 1,
        weeksOnChart: 1,
        chartDate: new Date().toISOString().split('T')[0],
        sparklineData: generateSparkline(genreBuckets[genreSlug].length + 1),
      })
    }

    // Write each genre chart to KV
    const genreIndex: Array<{slug: string; name: string; color: string; songCount: number}> = []
    
    for (const [slug, items] of Object.entries(genreBuckets)) {
      await writeKV(env, `charts:genre:${slug}`, items)
      
      // Find the original genre name
      const genreName = Object.entries(GENRE_MAP).find(([_, s]) => s === slug)?.[0] || slug
      
      genreIndex.push({
        slug,
        name: genreName,
        color: GENRE_COLORS[slug] || '#8B5CF6',
        songCount: items.length,
      })
      
      console.log(`[genre-charts] ${slug} — ${items.length} songs`)
    }

    // Write genre index
    await writeKV(env, 'genres:index', genreIndex)
    console.log(`[genre-charts] Done — ${genreIndex.length} genres indexed`)

  } catch (err) {
    console.error('[genre-charts] error:', err)
  }
}
