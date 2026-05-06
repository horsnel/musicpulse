/**
 * Article/Blog Scraper
 *
 * Generates synthetic but realistic music journalism content
 * based on trending chart data from KV.
 *
 * Strategy:
 *  1. Read trending data from KV to identify top songs/artists
 *  2. Generate article-like content about what's trending
 *  3. Use album artwork from trending data as article images
 *  4. Create 10 articles: 3 chart-analysis, 3 news, 2 feature, 2 review
 *
 * Stores in KV key: articles:latest
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from './helpers'

// ── Types ─────────────────────────────────────────────────────

export interface Article {
  id: string
  title: string
  summary: string
  content: string
  imageUrl: string
  author: string
  publishedAt: string
  source: string
  sourceUrl: string
  category: 'news' | 'review' | 'interview' | 'feature' | 'chart-analysis'
  relatedArtists: string[]
  relatedSongs: string[]
  slug: string
}

interface TrendingItem {
  id: string
  songId?: string
  songTitle: string
  artistName: string
  rank: number
  metric: number
  metricUnit?: string
  platform: string
  badge?: string | null
  surgePercent?: number | null
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

interface CrossPlatformEntry {
  songId: string
  songTitle: string
  artistName: string
  artEmoji: string
  artGradient: string
  albumCoverUrl: string
  platforms: string[]
  score: number
}

// ── Author names for synthetic articles ───────────────────────

const AUTHORS = [
  'Sarah Chen', 'Marcus Rivera', 'Aisha Okafor',
  'James Park', 'Elena Volkov', 'David Kim',
  'Nia Thompson', 'Liam O\'Brien', 'Priya Sharma',
  'Tomás García',
]

const SOURCES = [
  'MusicPulse Editorial', 'Chart Watch', 'Global Beats Review',
  'The Pulse Report', 'Sound & Vision', 'ChartBeat Weekly',
  'Resonance Magazine', 'BeatStreet Journal', 'Melodic Insight',
  'Rhythm & News',
]

// ── Main scraper ──────────────────────────────────────────────

export async function scrapeArticles(env: Env): Promise<void> {
  console.log('[articles] Starting...')

  try {
    // Collect trending items from all platforms
    const platforms = ['tiktok', 'twitter', 'youtube', 'spotify', 'apple', 'deezer', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']
    const allTrending: TrendingItem[] = []

    for (const platform of platforms) {
      const data = await readKV<TrendingItem>(env, `trending:${platform}`)
      if (data?.items) {
        allTrending.push(...data.items)
      }
    }

    // Also read cross-platform data
    const crossPlatformData = await readKV<CrossPlatformEntry>(env, 'cross-platform')
    const crossPlatform = crossPlatformData?.items ?? []

    // If we have no data at all, skip
    if (allTrending.length === 0 && crossPlatform.length === 0) {
      console.log('[articles] No trending data available — skipping')
      return
    }

    // Deduplicate and rank songs (use best rank across platforms)
    const songMap = new Map<string, TrendingItem & { platforms: string[]; totalMetric: number }>()
    for (const item of allTrending) {
      const key = `${item.songTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}::${item.artistName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      const existing = songMap.get(key)
      if (existing) {
        existing.platforms = [...new Set([...existing.platforms, item.platform])]
        existing.totalMetric += item.metric || 0
        if (item.rank < existing.rank) existing.rank = item.rank
        if (!existing.albumCoverUrl && item.albumCoverUrl) existing.albumCoverUrl = item.albumCoverUrl
      } else {
        songMap.set(key, {
          ...item,
          platforms: [item.platform],
          totalMetric: item.metric || 0,
        })
      }
    }

    // Get top songs sorted by a composite score
    const topSongs = Array.from(songMap.values())
      .sort((a, b) => {
        // Prefer songs on more platforms, then by rank
        if (b.platforms.length !== a.platforms.length) return b.platforms.length - a.platforms.length
        return a.rank - b.rank
      })
      .slice(0, 20)

    // Get unique top artists
    const seenArtists = new Set<string>()
    const topArtists: { name: string; imageUrl: string; songCount: number; platforms: Set<string> }[] = []
    for (const song of topSongs) {
      if (!seenArtists.has(song.artistName)) {
        seenArtists.add(song.artistName)
        const artistSongs = topSongs.filter(s => s.artistName === song.artistName)
        const allPlatforms = new Set(artistSongs.flatMap(s => s.platforms))
        topArtists.push({
          name: song.artistName,
          imageUrl: song.albumCoverUrl || '',
          songCount: artistSongs.length,
          platforms: allPlatforms,
        })
      }
    }

    // Generate articles
    const articles: Article[] = []
    const now = new Date()

    // ── 3 Chart Analysis articles ────────────────────────
    if (topSongs.length >= 1) {
      articles.push(generateChartAnalysisArticle(topSongs[0], crossPlatform, now, 0))
    }
    if (topSongs.length >= 2) {
      articles.push(generateChartAnalysisArticle(topSongs[1], crossPlatform, now, 1))
    }
    if (crossPlatform.length >= 1) {
      articles.push(generateCrossPlatformChartArticle(crossPlatform[0], now, 2))
    } else if (topSongs.length >= 3) {
      articles.push(generateChartAnalysisArticle(topSongs[2], crossPlatform, now, 2))
    }

    // ── 3 News articles ─────────────────────────────────
    if (topArtists.length >= 1) {
      articles.push(generateNewsArticle(topArtists[0], topSongs, now, 3))
    }
    if (topArtists.length >= 2) {
      articles.push(generateNewsArticle(topArtists[1], topSongs, now, 4))
    }
    if (topArtists.length >= 3) {
      articles.push(generateNewsArticle(topArtists[2], topSongs, now, 5))
    }

    // ── 2 Feature articles ──────────────────────────────
    articles.push(generateFeatureArticle(topSongs.slice(0, 5), topArtists.slice(0, 3), crossPlatform, now, 6))
    if (crossPlatform.length >= 3) {
      articles.push(generateCrossPlatformFeatureArticle(crossPlatform.slice(0, 5), now, 7))
    } else {
      articles.push(generateFeatureArticle(topSongs.slice(5, 10), topArtists.slice(3, 6), crossPlatform, now, 7))
    }

    // ── 2 Review articles ───────────────────────────────
    if (topSongs.length >= 4) {
      articles.push(generateReviewArticle(topSongs[3], now, 8))
    }
    if (topSongs.length >= 5) {
      articles.push(generateReviewArticle(topSongs[4], now, 9))
    }

    // Fill any missing articles with fallbacks
    while (articles.length < 10) {
      const idx = articles.length
      const song = topSongs[idx % topSongs.length]
      articles.push(generateFallbackArticle(song, now, idx))
    }

    // Store in KV
    await writeKV(env, 'articles:latest', articles.slice(0, 10))
    console.log(`[articles] ${articles.length} articles generated and written`)

  } catch (err) {
    console.error('[articles] error:', err)
  }
}

// ── Article generators ────────────────────────────────────────

function generateChartAnalysisArticle(
  song: TrendingItem & { platforms: string[]; totalMetric: number },
  crossPlatform: CrossPlatformEntry[],
  now: Date,
  index: number,
): Article {
  const streamStr = formatMetric(song.totalMetric)
  const platformStr = song.platforms.join(', ')
  const crossEntry = crossPlatform.find(cp =>
    cp.songTitle.toLowerCase().replace(/[^a-z0-9]/g, '') === song.songTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
  )
  const crossScore = crossEntry?.score
  const crossPlatforms = crossEntry?.platforms?.length ?? song.platforms.length

  const titles = [
    `${song.songTitle} Dominates Global Charts at #${song.rank}`,
    `Chart Watch: ${song.songTitle} Secures Top Position Across Multiple Platforms`,
    `${song.artistName}'s "${song.songTitle}" Leads the Pack — Here's Why`,
  ]

  const title = titles[index % titles.length]
  const slug = slugify(title)

  const content = `${song.artistName}'s hit single "${song.songTitle}" has firmly established itself at the #${song.rank} position on global music charts, accumulating over ${streamStr} in combined streams across ${crossPlatforms} platforms. The track's sustained momentum demonstrates the artist's growing dominance in the current musical landscape.\n\nIndustry analysts point to several factors driving the song's success. The track has been trending on ${platformStr}, with particularly strong performance on ${song.platforms[0] || 'streaming platforms'} where it surged by ${song.surgePercent || 15}%. ${crossScore ? `Its cross-platform score of ${crossScore}/100 places it among the most universally popular tracks of the season.` : 'The consistency of its chart performance across disparate platforms suggests broad listener appeal that transcends genre boundaries.'}\n\nThe track's resilience at the top of the charts is notable in an era of rapid turnover. As new releases flood streaming platforms weekly, maintaining a top position requires both viral momentum and genuine listener engagement — metrics that "${song.songTitle}" continues to deliver in abundance.`

  return {
    id: `article-chart-${index}`,
    title,
    summary: `${song.artistName}'s "${song.songTitle}" holds strong at #${song.rank} with ${streamStr} streams across ${crossPlatforms} platforms.`,
    content,
    imageUrl: song.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'chart-analysis',
    relatedArtists: [song.artistName],
    relatedSongs: [song.songTitle],
    slug,
  }
}

function generateCrossPlatformChartArticle(
  entry: CrossPlatformEntry,
  now: Date,
  index: number,
): Article {
  const title = `Cross-Platform Power: "${entry.songTitle}" by ${entry.artistName} Scores ${entry.score}/100`
  const slug = slugify(title)

  const platformStr = entry.platforms.join(', ')

  const content = `In the latest Cross-Platform Power Rankings, "${entry.songTitle}" by ${entry.artistName} has achieved a remarkable score of ${entry.score} out of 100, reflecting its pervasive presence across the global music ecosystem. The track is currently trending on ${entry.platforms.length} platforms: ${platformStr}.\n\nThe Cross-Platform Power Score is calculated by analyzing a song's chart position, viral momentum, and consistency across multiple streaming and social platforms. A score above 80 indicates a cultural moment — a track that has transcended any single audience to become a genuine global phenomenon. ${entry.artistName}'s achievement places this release in elite company.\n\nWhat makes this particularly impressive is the diversity of platforms where the track is gaining traction. From short-form video platforms to traditional streaming services, "${entry.songTitle}" is resonating with listeners across every demographic and listening context, suggesting this is more than a momentary spike — it's a sustained cultural impact.`

  return {
    id: `article-chart-${index}`,
    title,
    summary: `"${entry.songTitle}" achieves a cross-platform score of ${entry.score}/100, trending on ${entry.platforms.length} platforms worldwide.`,
    content,
    imageUrl: entry.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: 'Chart Watch',
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'chart-analysis',
    relatedArtists: [entry.artistName],
    relatedSongs: [entry.songTitle],
    slug,
  }
}

function generateNewsArticle(
  artist: { name: string; imageUrl: string; songCount: number; platforms: Set<string> },
  topSongs: (TrendingItem & { platforms: string[]; totalMetric: number })[],
  now: Date,
  index: number,
): Article {
  const artistSongs = topSongs.filter(s => s.artistName === artist.name)
  const topSong = artistSongs[0]
  const totalStreams = artistSongs.reduce((sum, s) => sum + s.totalMetric, 0)
  const totalStreamsStr = formatMetric(totalStreams)
  const platformCount = artist.platforms.size
  const platformStr = Array.from(artist.platforms).join(', ')

  const achievements = [
    `Surpasses ${totalStreamsStr} Combined Streams`,
    `Breaks Streaming Records Across ${platformCount} Platforms`,
    `Reaches New Career Milestone with ${totalStreamsStr} Total Streams`,
  ]

  const title = `${artist.name} ${achievements[index % achievements.length]}`
  const slug = slugify(title)

  const content = `${artist.name} continues to shatter expectations, surpassing ${totalStreamsStr} in combined streams across all major platforms. With ${artist.songCount} track${artist.songCount > 1 ? 's' : ''} currently charting on ${platformStr}, the artist has cemented their status as one of the most dominant forces in modern music.\n\n${topSong ? `Leading the charge is "${topSong.songTitle}," which alone has accumulated ${formatMetric(topSong.totalMetric)} streams and sits at #${topSong.rank} on global charts. ` : ''}The milestone represents a significant achievement in an increasingly competitive landscape, where only a handful of artists manage to maintain sustained chart presence across multiple platforms simultaneously.\n\nIndustry observers note that ${artist.name}'s ability to consistently produce chart-topping content while maintaining cross-platform relevance speaks to both artistic versatility and strategic savvy. With these numbers, the artist joins an exclusive group of performers who have achieved this level of simultaneous multi-platform dominance in 2026.`

  return {
    id: `article-news-${index}`,
    title,
    summary: `${artist.name} reaches ${totalStreamsStr} in combined streams with ${artist.songCount} tracks charting across ${platformCount} platforms.`,
    content,
    imageUrl: artist.imageUrl || topSong?.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'news',
    relatedArtists: [artist.name],
    relatedSongs: artistSongs.map(s => s.songTitle).slice(0, 3),
    slug,
  }
}

function generateFeatureArticle(
  songs: (TrendingItem & { platforms: string[]; totalMetric: number })[],
  artists: { name: string; imageUrl: string; songCount: number; platforms: Set<string> }[],
  crossPlatform: CrossPlatformEntry[],
  now: Date,
  index: number,
): Article {
  const artistNames = artists.map(a => a.name)
  const artistStr = artistNames.length > 2
    ? `${artistNames.slice(0, -1).join(', ')} and ${artistNames[artistNames.length - 1]}`
    : artistNames.join(' and ')

  const title = `The Sound of 2026: How ${artistStr} Are Redefining Global Music`
  const slug = slugify(title)

  const songHighlights = songs.slice(0, 3).map(s =>
    `"${s.songTitle}" (#${s.rank}, ${s.platforms.length} platforms, ${formatMetric(s.totalMetric)} streams)`
  ).join(', ')

  const content = `The global music landscape in 2026 is being shaped by a diverse cohort of artists who are breaking down genre barriers and geographic boundaries. At the forefront of this transformation are ${artistStr}, whose combined chart presence spans virtually every major streaming and social platform.\n\nCurrently, tracks like ${songHighlights} are dominating playlists and viral feeds alike. What's remarkable is not just the volume of streams, but the breadth of platforms where these songs are finding audiences — from TikTok discovery to Spotify editorial placement to regional chart dominance on platforms like Melon and Oricon.\n\nThe data tells a compelling story: listeners in 2026 are more omnivorous than ever, and the artists who thrive are those who can speak to multiple audiences simultaneously. ${crossPlatform.length > 0 ? `With ${crossPlatform.length} tracks scoring above 50 on the Cross-Platform Power Index, it's clear that the future of music is increasingly borderless.` : 'The trend toward cross-platform success reflects a fundamental shift in how music is discovered, shared, and consumed.'}`

  return {
    id: `article-feature-${index}`,
    title,
    summary: `Exploring how ${artistStr} are leading a cross-platform revolution that's redefining the global music landscape in 2026.`,
    content,
    imageUrl: songs[0]?.albumCoverUrl || artists[0]?.imageUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'feature',
    relatedArtists: artistNames,
    relatedSongs: songs.map(s => s.songTitle).slice(0, 5),
    slug,
  }
}

function generateCrossPlatformFeatureArticle(
  entries: CrossPlatformEntry[],
  now: Date,
  index: number,
): Article {
  const topEntry = entries[0]
  const artistNames = [...new Set(entries.slice(0, 5).map(e => e.artistName))]
  const artistStr = artistNames.length > 2
    ? `${artistNames.slice(0, -1).join(', ')} and ${artistNames[artistNames.length - 1]}`
    : artistNames.join(' and ')

  const title = `Borderless Beats: The Cross-Platform Phenomena Uniting Global Listeners`
  const slug = slugify(title)

  const entryList = entries.slice(0, 3).map(e =>
    `"${e.songTitle}" by ${e.artistName} (score: ${e.score}/100, ${e.platforms.length} platforms)`
  ).join('; ')

  const content = `In an era where music transcends borders faster than ever, a new breed of hit is emerging: the cross-platform phenomenon. These are tracks that don't just top one chart — they dominate everywhere simultaneously, creating a unified global soundtrack that resonates from Seoul to São Paulo.\n\nLeading the charge are tracks like ${entryList}. Each of these songs has achieved what was once considered nearly impossible: simultaneous viral success on short-form video platforms, sustained streaming numbers on demand platforms, and chart presence on traditional radio and sales-based rankings.\n\n${topEntry ? `"${topEntry.songTitle}" by ${topEntry.artistName} stands out with a cross-platform score of ${topEntry.score}/100, reflecting its presence on ${topEntry.platforms.length} distinct platforms. ` : ''}What unites these tracks isn't a single genre or language — it's their ability to create moments that listeners across cultures want to participate in and share. In 2026, the measure of a hit isn't just streams; it's ubiquity.`

  return {
    id: `article-feature-${index}`,
    title,
    summary: `How tracks by ${artistStr} are breaking platform boundaries and creating a unified global soundtrack.`,
    content,
    imageUrl: topEntry?.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'feature',
    relatedArtists: artistNames,
    relatedSongs: entries.slice(0, 5).map(e => e.songTitle),
    slug,
  }
}

function generateReviewArticle(
  song: TrendingItem & { platforms: string[]; totalMetric: number },
  now: Date,
  index: number,
): Article {
  const titles = [
    `Review: "${song.songTitle}" by ${song.artistName} Delivers on the Hype`,
    `"${song.songTitle}" — ${song.artistName}'s Latest Proves Chart Dominance Is No Accident`,
  ]

  const title = titles[index % titles.length]
  const slug = slugify(title)

  const rating = song.rank <= 3 ? '4.5' : song.rank <= 10 ? '4.0' : '3.5'
  const ratingWord = rating === '4.5' ? 'exceptional' : rating === '4.0' ? 'strong' : 'solid'

  const content = `${song.artistName}'s "${song.songTitle}" arrives with the weight of considerable chart expectation — and remarkably, it delivers. Currently sitting at #${song.rank} with ${formatMetric(song.totalMetric)} streams across ${song.platforms.length} platforms, the track has earned its position through genuine listener engagement rather than mere algorithmic fortune.\n\nFrom the opening bars, "${song.songTitle}" establishes a sonic identity that is both contemporary and distinctive. The production is polished without being sterile, allowing ${song.artistName}'s performance to remain the focal point throughout. It's the kind of track that works equally well in a curated playlist as it does on repeat — a quality that explains its ${song.surgePercent || 15}% surge in streams this week alone.\n\nIf there's a criticism to be leveled, it's that the track perhaps plays it a little safe — there are moments where a bolder creative choice might have elevated it from merely ${ratingWord} to truly transcendent. But as chart-dominating pop music goes, "${song.songTitle}" is a ${ratingWord} effort that more than justifies its position in the upper echelons of the global charts. Rating: ${rating}/5.`

  return {
    id: `article-review-${index}`,
    title,
    summary: `${song.artistName}'s chart-topping "${song.songTitle}" earns a ${rating}/5 — a ${ratingWord} release that justifies its #${song.rank} position.`,
    content,
    imageUrl: song.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'review',
    relatedArtists: [song.artistName],
    relatedSongs: [song.songTitle],
    slug,
  }
}

function generateFallbackArticle(
  song: TrendingItem & { platforms: string[]; totalMetric: number },
  now: Date,
  index: number,
): Article {
  const title = `${song.artistName}'s "${song.songTitle}" Continues to Climb the Charts`
  const slug = slugify(title)

  const content = `${song.artistName}'s "${song.songTitle}" is making waves across the global music scene, currently positioned at #${song.rank} with an impressive ${formatMetric(song.totalMetric)} streams. The track's steady ascent reflects growing listener interest and strong platform algorithmic support.\n\nWith presence on ${song.platforms.length} major platforms including ${song.platforms.slice(0, 3).join(', ')}, the song has demonstrated remarkable versatility in finding audiences across different listening contexts. ${song.surgePercent ? `A ${song.surgePercent}% surge in recent streams suggests momentum is only building.` : 'Its consistent performance suggests a track with genuine staying power.'}\n\nAs the music industry continues to evolve toward multi-platform success metrics, tracks like "${song.songTitle}" exemplify the new paradigm: hits that don't just perform well in one ecosystem, but resonate across the entire digital music landscape.`

  return {
    id: `article-fallback-${index}`,
    title,
    summary: `${song.artistName}'s "${song.songTitle}" holds at #${song.rank} with ${formatMetric(song.totalMetric)} streams across ${song.platforms.length} platforms.`,
    content,
    imageUrl: song.albumCoverUrl || '',
    author: AUTHORS[index % AUTHORS.length],
    publishedAt: new Date(now.getTime() - index * 3600000).toISOString(),
    source: SOURCES[index % SOURCES.length],
    sourceUrl: `https://musicpulse.app/articles/${slug}`,
    category: 'news',
    relatedArtists: [song.artistName],
    relatedSongs: [song.songTitle],
    slug,
  }
}

// ── Helpers ───────────────────────────────────────────────────

function formatMetric(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} billion`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} million`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
