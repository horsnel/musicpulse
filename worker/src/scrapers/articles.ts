/**
 * Article/Blog Scraper — Real API Edition
 *
 * Fetches real music news from NewsAPI.org and NewsDataIO,
 * enriches with Pixabay stock images when article images are missing,
 * and falls back to synthetic articles from trending chart data.
 *
 * API keys (optional — gracefully degrades):
 *  - NEWSAPI_KEY     → newsapi.org (100 req/day free)
 *  - NEWSDATAIO_KEY  → newsdata.io (200 req/day free)
 *  - PIXABAY_API_KEY → pixabay.com (5000 req/hour free)
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

// Pixabay image cache (per-scrape)
const pixabayCache = new Map<string, string>()

// ── Main scraper ──────────────────────────────────────────────

export async function scrapeArticles(env: Env): Promise<void> {
  console.log('[articles] Starting...')

  try {
    const articles: Article[] = []

    // ── Step 1: Fetch real articles from News APIs ───────────
    const [newsApiArticles, newsDataArticles] = await Promise.allSettled([
      fetchNewsAPI(env),
      fetchNewsDataIO(env),
    ])

    if (newsApiArticles.status === 'fulfilled' && newsApiArticles.value.length > 0) {
      articles.push(...newsApiArticles.value)
      console.log(`[articles] ${newsApiArticles.value.length} articles from NewsAPI`)
    }
    if (newsDataArticles.status === 'fulfilled' && newsDataArticles.value.length > 0) {
      articles.push(...newsDataArticles.value)
      console.log(`[articles] ${newsDataArticles.value.length} articles from NewsDataIO`)
    }

    // ── Step 2: Enrich missing images with Pixabay ────────────
    if (env.PIXABAY_API_KEY) {
      await enrichWithPixabay(env, articles)
    }

    // ── Step 3: Supplement with chart-based articles if needed ─
    if (articles.length < 10) {
      const syntheticArticles = await generateSyntheticArticles(env, articles.length)
      articles.push(...syntheticArticles)
    }

    // Sort by publishedAt descending
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Deduplicate by slug
    const seenSlugs = new Set<string>()
    const uniqueArticles = articles.filter(a => {
      if (seenSlugs.has(a.slug)) return false
      seenSlugs.add(a.slug)
      return true
    })

    // Store in KV
    await writeKV(env, 'articles:latest', uniqueArticles.slice(0, 20))
    console.log(`[articles] ${uniqueArticles.length} articles written (${articles.filter(a => a.source !== 'MusicPulse Editorial' && !SOURCES.includes(a.source)).length} real, ${articles.filter(a => a.source === 'MusicPulse Editorial' || SOURCES.includes(a.source)).length} synthetic)`)

  } catch (err) {
    console.error('[articles] error:', err)
  }
}

// ── NewsAPI.org Fetcher ────────────────────────────────────────

async function fetchNewsAPI(env: Env): Promise<Article[]> {
  if (!env.NEWSAPI_KEY) return []

  const articles: Article[] = []

  // NewsAPI free plan: everything endpoint, limited to 100 req/day
  const queries = [
    { q: 'music chart OR album release OR concert tour', category: 'news' as const },
    { q: 'Billboard Hot 100 OR Spotify charts OR Apple Music', category: 'chart-analysis' as const },
  ]

  for (const { q, category } of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?${new URLSearchParams({
        q,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '10',
        page: '1',
        apiKey: env.NEWSAPI_KEY,
      })}`

      const res = await fetch(url, {
        headers: { 'User-Agent': 'MusicPulse/1.0' },
      })

      if (!res.ok) {
        console.warn(`[articles] NewsAPI HTTP ${res.status}: ${await res.text().catch(() => '')}`)
        continue
      }

      const data = await res.json() as {
        status: string
        totalResults: number
        articles: Array<{
          source: { id: string | null; name: string }
          author: string | null
          title: string
          description: string | null
          url: string
          urlToImage: string | null
          publishedAt: string
          content: string | null
        }>
      }

      if (data.status !== 'ok' || !data.articles) continue

      for (let i = 0; i < data.articles.length && articles.length < 10; i++) {
        const item = data.articles[i]
        if (!item.title || item.title === '[Removed]') continue

        const slug = slugify(item.title)

        articles.push({
          id: `article-newsapi-${articles.length}`,
          title: item.title,
          summary: item.description || item.title,
          content: item.content
            ? item.content.replace(/\[\+\d+ chars\]/, '').trim()
            : (item.description || item.title),
          imageUrl: item.urlToImage || '',
          author: item.author || 'Staff Reporter',
          publishedAt: item.publishedAt,
          source: item.source?.name || 'NewsAPI',
          sourceUrl: item.url,
          category,
          relatedArtists: extractArtists(item.title + ' ' + (item.description || '')),
          relatedSongs: [],
          slug,
        })
      }

      // Rate limit: wait between queries
      await new Promise(r => setTimeout(r, 300))

    } catch (err) {
      console.error('[articles] NewsAPI error:', err)
    }
  }

  return articles
}

// ── NewsDataIO Fetcher ─────────────────────────────────────────

async function fetchNewsDataIO(env: Env): Promise<Article[]> {
  if (!env.NEWSDATAIO_KEY) return []

  const articles: Article[] = []

  try {
    const url = `https://newsdata.io/api/1/news?${new URLSearchParams({
      q: 'music OR album OR concert OR charts OR Billboard',
      language: 'en',
      category: 'entertainment',
      size: '10',
      apikey: env.NEWSDATAIO_KEY,
    })}`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'MusicPulse/1.0' },
    })

    if (!res.ok) {
      console.warn(`[articles] NewsDataIO HTTP ${res.status}`)
      return articles
    }

    const data = await res.json() as {
      status: string
      results: Array<{
        article_id: string
        title: string
        description: string | null
        link: string
        image_url: string | null
        pubDate: string
        source_id: string
        creator: string[] | null
        content: string | null
        keywords: string[] | null
      }>
    }

    if (data.status !== 'success' || !data.results) return articles

    for (let i = 0; i < data.results.length && articles.length < 10; i++) {
      const item = data.results[i]
      if (!item.title) continue

      const slug = slugify(item.title)
      const category = inferCategory(item.title + ' ' + (item.description || '') + ' ' + (item.keywords?.join(' ') || ''))

      articles.push({
        id: `article-newsdata-${i}`,
        title: item.title,
        summary: item.description || item.title,
        content: item.content
          ? item.content.replace(/\[\+\d+ chars\]/, '').trim().substring(0, 2000)
          : (item.description || item.title),
        imageUrl: item.image_url || '',
        author: item.creator?.[0] || 'Staff Reporter',
        publishedAt: item.pubDate,
        source: item.source_id || 'NewsDataIO',
        sourceUrl: item.link,
        category,
        relatedArtists: extractArtists(item.title + ' ' + (item.description || '')),
        relatedSongs: [],
        slug,
      })
    }

  } catch (err) {
    console.error('[articles] NewsDataIO error:', err)
  }

  return articles
}

// ── Pixabay Image Enrichment ──────────────────────────────────

async function enrichWithPixabay(env: Env, articles: Article[]): Promise<void> {
  const missingImage = articles.filter(a => !a.imageUrl)

  for (const article of missingImage.slice(0, 5)) { // Limit to 5 Pixabay calls per scrape
    try {
      // Extract key terms for image search
      const searchTerms = extractImageSearchTerms(article.title)
      if (!searchTerms) continue

      // Check cache first
      if (pixabayCache.has(searchTerms)) {
        article.imageUrl = pixabayCache.get(searchTerms)!
        continue
      }

      const url = `https://pixabay.com/api/?${new URLSearchParams({
        key: env.PIXABAY_API_KEY!,
        q: searchTerms,
        image_type: 'photo',
        category: 'music',
        per_page: '3',
        safesearch: 'true',
        min_width: '800',
      })}`

      const res = await fetch(url, {
        headers: { 'User-Agent': 'MusicPulse/1.0' },
      })

      if (!res.ok) continue

      const data = await res.json() as {
        hits: Array<{
          webformatURL: string
          largeImageURL: string
          previewURL: string
        }>
      }

      if (data.hits?.[0]?.webformatURL) {
        const imageUrl = data.hits[0].webformatURL.replace('_640', '_1280')
        article.imageUrl = imageUrl
        pixabayCache.set(searchTerms, imageUrl)
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 200))

    } catch (err) {
      // Silently fail — images are nice-to-have
    }
  }
}

// ── Synthetic Article Generator (fallback) ─────────────────────

async function generateSyntheticArticles(env: Env, existingCount: number): Promise<Article[]> {
  const articles: Article[] = []

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

  if (allTrending.length === 0 && crossPlatform.length === 0) {
    console.log('[articles] No trending data available — skipping synthetic generation')
    return articles
  }

  // Deduplicate and rank songs
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
      songMap.set(key, { ...item, platforms: [item.platform], totalMetric: item.metric || 0 })
    }
  }

  const topSongs = Array.from(songMap.values())
    .sort((a, b) => b.platforms.length - a.platforms.length || a.rank - b.rank)
    .slice(0, 20)

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

  const now = new Date()
  const needed = Math.max(0, 10 - existingCount)

  // Chart Analysis
  if (needed > 0 && topSongs.length >= 1) {
    articles.push(generateChartAnalysisArticle(topSongs[0], crossPlatform, now, 0))
  }
  if (needed > 1 && topSongs.length >= 2) {
    articles.push(generateChartAnalysisArticle(topSongs[1], crossPlatform, now, 1))
  }
  if (needed > 2 && crossPlatform.length >= 1) {
    articles.push(generateCrossPlatformChartArticle(crossPlatform[0], now, 2))
  } else if (needed > 2 && topSongs.length >= 3) {
    articles.push(generateChartAnalysisArticle(topSongs[2], crossPlatform, now, 2))
  }

  // News
  if (needed > 3 && topArtists.length >= 1) {
    articles.push(generateNewsArticle(topArtists[0], topSongs, now, 3))
  }
  if (needed > 4 && topArtists.length >= 2) {
    articles.push(generateNewsArticle(topArtists[1], topSongs, now, 4))
  }

  // Feature
  if (needed > 5) {
    articles.push(generateFeatureArticle(topSongs.slice(0, 5), topArtists.slice(0, 3), crossPlatform, now, 5))
  }

  // Review
  if (needed > 6 && topSongs.length >= 4) {
    articles.push(generateReviewArticle(topSongs[3], now, 6))
  }
  if (needed > 7 && topSongs.length >= 5) {
    articles.push(generateReviewArticle(topSongs[4], now, 7))
  }

  // Fill remaining
  while (articles.length < needed) {
    const idx = articles.length + existingCount
    const song = topSongs[idx % topSongs.length]
    articles.push(generateFallbackArticle(song, now, idx))
  }

  return articles
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

  const achievements = [
    `Surpasses ${totalStreamsStr} Combined Streams`,
    `Breaks Streaming Records Across ${platformCount} Platforms`,
    `Reaches New Career Milestone with ${totalStreamsStr} Total Streams`,
  ]

  const title = `${artist.name} ${achievements[index % achievements.length]}`
  const slug = slugify(title)

  const content = `${artist.name} continues to shatter expectations, surpassing ${totalStreamsStr} in combined streams across all major platforms. With ${artist.songCount} track${artist.songCount > 1 ? 's' : ''} currently charting, the artist has cemented their status as one of the most dominant forces in modern music.\n\n${topSong ? `Leading the charge is "${topSong.songTitle}," which alone has accumulated ${formatMetric(topSong.totalMetric)} streams and sits at #${topSong.rank} on global charts. ` : ''}The milestone represents a significant achievement in an increasingly competitive landscape, where only a handful of artists manage to maintain sustained chart presence across multiple platforms simultaneously.\n\nIndustry observers note that ${artist.name}'s ability to consistently produce chart-topping content while maintaining cross-platform relevance speaks to both artistic versatility and strategic savvy. With these numbers, the artist joins an exclusive group of performers who have achieved this level of simultaneous multi-platform dominance in 2026.`

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

/**
 * Extract artist names from article text using simple heuristics.
 * Looks for common patterns like "Artist's", "by Artist", "Artist and Artist".
 */
function extractArtists(text: string): string[] {
  const artists: string[] = []
  const patterns = [
    /([A-Z][a-z]+(?: [A-Z][a-z]+)*)'s (?:new |latest |hit )?(?:album|single|track|song|release|EP)/g,
    /by ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+(?: [A-Z][a-z]+)*) (?:and|&) ([A-Z][a-z]+(?: [A-Z][a-z]+)*) (?:announce|release|drop|tour)/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      for (let i = 1; i < match.length; i++) {
        const name = match[i]?.trim()
        if (name && name.length > 2 && name.length < 40 && !['The', 'New', 'Billboard', 'Spotify', 'Apple', 'Music'].includes(name)) {
          if (!artists.includes(name)) artists.push(name)
        }
      }
    }
  }

  return artists.slice(0, 3)
}

/**
 * Infer article category from title and keywords.
 */
function inferCategory(text: string): Article['category'] {
  const lower = text.toLowerCase()
  if (/chart|billboard|hot 100|top \d+|ranking|spotify chart|apple music chart/.test(lower)) return 'chart-analysis'
  if (/review|rating|album review|track review|verdict/.test(lower)) return 'review'
  if (/interview|q&a|exclusive|speak|talk/.test(lower)) return 'interview'
  if (/feature|deep dive|exploring|behind|story of/.test(lower)) return 'feature'
  return 'news'
}

/**
 * Extract relevant search terms from an article title for Pixabay.
 */
function extractImageSearchTerms(title: string): string {
  // Remove common filler words and extract key nouns
  const cleaned = title
    .replace(/\b(the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|shall|should|may|might|must|can|could|of|in|to|for|with|on|at|by|from|as|into|through|during|before|after|above|below|between|out|off|over|under|again|further|then|once|here|there|when|where|why|how|all|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|just|about|up)\b/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Take the first 3-4 significant words
  const words = cleaned.split(' ').filter(w => w.length > 2).slice(0, 4)
  if (words.length === 0) return ''
  return words.join(' ') + ' music'
}
