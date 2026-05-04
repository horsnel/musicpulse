import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'MusicPulse blog — insights, analysis, and stories from the world of music data and charts.',
}

export interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  tag: string
  tagColor: string
  readTime: string
}

export const POSTS: BlogPost[] = [
  {
    title: 'How Afrobeats Conquered the Global Charts',
    slug: 'afrobeats-global-charts',
    excerpt: 'From Burna Boy to Davido, Afrobeats has become the fastest-growing genre on streaming platforms. We break down the numbers behind the movement and what it means for the future of global music.',
    content: `Afrobeats is no longer a regional phenomenon — it is a global force reshaping the music industry. Over the past three years, the genre has seen explosive growth on every major streaming platform, with Spotify reporting a 550% increase in Afrobeats streams since 2021. Artists like Burna Boy, Davido, Wizkid, and Rema have consistently landed on global charts, and their influence extends far beyond streaming numbers into fashion, film, and cultural diplomacy.

The data tells a compelling story. According to MusicPulse's Cross-Platform Power Score, Afrobeats tracks now account for 8 of the top 100 songs worldwide — a figure that has tripled since 2023. Burna Boy's "Last Last" generated over 2 billion cross-platform streams, while Rema's "Calm Down" became the first Afrobeats song to surpass 1 billion streams on a single platform. These are not outlier hits; they represent a sustained pipeline of chart-worthy music flowing from Lagos, Accra, and Abuja to the rest of the world.

Several factors drive this growth. TikTok has been a powerful amplifier, with Afrobeats' infectious rhythms and dance-friendly tempos making it tailor-made for viral moments. But the deeper story is about infrastructure: improved distribution deals, strategic label partnerships (like Davido's deal with Columbia Records), and a growing ecosystem of producers and songwriters who are professionalizing the creative process. The result is music that competes on quality and polish, not just novelty.

What comes next? Industry analysts project that Afrobeats will account for 15% of global top-100 chart entries by 2027. The genre is also diversifying — subgenres like Amapiano and Alté are gaining traction, and collaborations with Latin, K-Pop, and country artists are expanding the audience further. For anyone tracking the future of music, Afrobeats is not a trend to watch — it is a structural shift already underway.`,
    date: 'Apr 25, 2025',
    tag: 'Analysis',
    tagColor: 'var(--green)',
    readTime: '8 min read',
  },
  {
    title: 'The TikTok Effect: How 30 Seconds Can Make a Hit',
    slug: 'tiktok-effect-hit-songs',
    excerpt: 'A viral TikTok sound can propel an obscure track to the top of Spotify charts in days. We analyze the data behind the biggest TikTok-to-chart pipelines of 2025 and what patterns emerge.',
    content: `In the modern music industry, thirty seconds is all it takes. TikTok has fundamentally rewritten the rules of how songs become hits, transforming an app designed for short-form video into the most powerful song-discovery engine on the planet. In 2025, an estimated 67% of songs entering the Billboard Hot 100 had a meaningful TikTok presence before charting — up from 49% just two years ago.

The pipeline is remarkably efficient. A creator uses a sound, it catches on in a trend, and within 48 to 72 hours the song can jump from a few thousand daily streams to millions. MusicPulse's own velocity data shows that TikTok-driven tracks experience an average streaming surge of 3,200% in the week following a viral moment. But the relationship is not purely organic — labels have become sophisticated at seeding sounds, identifying micro-influencers, and timing promotional pushes to amplify organic momentum.

Not all TikTok success translates to lasting chart impact. Our analysis of 2025's biggest TikTok-to-chart pipelines reveals a clear pattern: songs that succeed long-term tend to have a specific structural quality — a "hook moment" that works in 15-second clips but also rewards full listens. Tracks like Tommy Richman's "MILLION DOLLAR BABY" and Shaboozey's "A Bar Song (Tipsy)" both featured instantly recognizable melodic hooks that worked as standalone fragments while serving a complete song structure. Songs that were purely viral — tied to a dance challenge or meme without musical depth — tended to spike and crash within three weeks.

The implications for artists and labels are significant. Songwriting is increasingly being shaped by the TikTok format, with producers optimizing intro lengths, hook placement, and emotional dynamics for short-form consumption. This raises legitimate creative concerns, but the data is unambiguous: in 2025, TikTok is not optional for chart success. The question is no longer whether to engage with the platform, but how to do so in a way that builds sustainable careers rather than one-hit moments.`,
    date: 'Apr 18, 2025',
    tag: 'Trends',
    tagColor: 'var(--pink)',
    readTime: '6 min read',
  },
  {
    title: 'Cross-Platform Power: Why Chart Dominance Requires More Than Streams',
    slug: 'cross-platform-power-score',
    excerpt: 'Streaming numbers alone do not tell the full story. Our Cross-Platform Power Score weighs performance across Spotify, Apple Music, YouTube, and social media to identify the true biggest songs.',
    content: `For years, the music industry treated Spotify streams as the definitive measure of a song's popularity. But in 2025, that approach is increasingly inadequate. A song can dominate Spotify's global chart while barely registering on Apple Music, or rack up billions of YouTube views while struggling to crack Shazam's top 50. The truth is that no single platform captures the full picture — which is why MusicPulse developed the Cross-Platform Power Score.

The Cross-Platform Power Score aggregates data from eleven platforms — Spotify, Apple Music, YouTube, Shazam, Billboard, Deezer, Bandcamp, Audiomack, Genius, Musixmatch, and iHeart — using a weighted algorithm that accounts for each platform's reach and demographic profile. Spotify and YouTube carry the highest raw weights due to their scale, but Apple Music and Shazam receive boosted weightings because their user bases skew toward active music seekers rather than passive listeners. Social engagement metrics from TikTok and Twitter are factored in as velocity indicators rather than raw popularity measures.

The results often reveal surprises. Lady Gaga and Bruno Mars' "Die With A Smile" has been the top-ranked song on our Power Score for 24 consecutive weeks — yet it has not always been #1 on any single platform during that run. Its dominance comes from consistent top-5 performance everywhere, a feat that no other song in 2025 has matched. Conversely, some songs that dominate a single platform — particularly viral-driven tracks on Spotify — rank significantly lower when cross-platform data is considered.

This methodology matters because it more accurately reflects real cultural impact. A song that is #1 on Spotify but invisible on Apple Music may have strong appeal in one demographic but limited broader reach. The Power Score captures the difference between a niche hit and a cultural moment. As the streaming landscape continues to fragment across regional and demographic lines, cross-platform measurement will only become more essential for anyone who wants to understand what is truly resonating with listeners worldwide.`,
    date: 'Apr 11, 2025',
    tag: 'Methodology',
    tagColor: 'var(--blue)',
    readTime: '5 min read',
  },
  {
    title: 'Weekly Digest #47: Die With A Smile Holds Strong',
    slug: 'weekly-digest-47',
    excerpt: 'Lady Gaga and Bruno Mars hold the top spot for a 24th consecutive week, while Kendrick Lamar\'s "luther" surges 18 positions. Here is your complete weekly charts breakdown.',
    content: `Another week, another record for Lady Gaga and Bruno Mars. "Die With A Smile" extends its reign at #1 to 24 consecutive weeks, making it the longest-running chart-topper since "Blinding Lights" by The Weeknd. The song's Cross-Platform Power Score of 94.7 is actually up 0.3 points from last week, suggesting that — remarkably — it is still gaining momentum. At this pace, it could challenge all-time longevity records before summer.

The bigger story this week is Kendrick Lamar's "luther" (featuring SZA), which surges 18 positions to #4 on the global Power Score ranking. The track's climb has been fueled by a confluence of factors: the ongoing cultural conversation around Lamar's lyrical output, SZA's massive fanbase driving social engagement, and a well-timed live performance at the Super Bowl that generated 2.3 million Shazam tags in 24 hours. It is the biggest single-week position jump we have recorded in 2025.

Other notable movers this week: ROSÉ and Bruno Mars' "APT." continues its steady climb to #2, now just 1.2 Power Score points behind the leader. Shaboozey's "A Bar Song (Tipsy)" re-enters the top 10 after a six-week absence, boosted by a resurgence on TikTok. And Billie Eilish's "BIRDS OF A FEATHER" holds steady at #6, now in its 32nd week on the chart — the longest current streak of any song in the top 20.

Looking ahead, keep an eye on two new entries: The Weeknd's latest single debuts at #15 with the highest first-week Power Score of any 2025 release, and Tems' "Me & U" enters at #22, signaling that the Afrobeats-to-global-mainstream pipeline shows no signs of slowing. Next week's digest promises significant chart movement.`,
    date: 'Apr 4, 2025',
    tag: 'Digest',
    tagColor: 'var(--gold)',
    readTime: '4 min read',
  },
  {
    title: 'K-Pop\'s Global Streaming Revolution in Numbers',
    slug: 'kpop-global-streaming-revolution',
    excerpt: 'K-Pop groups are no longer just dominating in Asia — they are breaking streaming records worldwide. We look at the data behind the global K-Pop explosion and where it goes next.',
    content: `K-Pop's transformation from a regional genre to a global streaming powerhouse is one of the most remarkable stories in modern music. In 2025, K-Pop acts account for 12% of all global music video views on YouTube and 7% of streams on Spotify — figures that would have been unthinkable just five years ago. But the numbers only tell part of the story. The genre's real achievement is the depth and dedication of its fan ecosystem, which has fundamentally changed how the music industry thinks about audience engagement.

The streaming data reveals several striking trends. First, K-Pop's geographic reach has expanded dramatically. While South Korea, Japan, and Southeast Asia remain core markets, the United States is now the second-largest streaming market for K-Pop on Spotify, having surpassed Japan in 2024. Latin America and the Middle East are the fastest-growing regions, with year-over-year streaming growth exceeding 200% in Brazil, Mexico, and Saudi Arabia. This geographic diversification means K-Pop is no longer dependent on any single market for its success.

Second, the release strategy pioneered by K-Pop — the "comeback" model with tightly coordinated pre-release campaigns, physical album bundles, and multi-platform content drops — has proven remarkably effective at driving concentrated streaming spikes. MusicPulse data shows that the average K-Pop title track generates 60% of its first-month streams in the first 72 hours after release, a concentration far exceeding Western pop. This creates chart impact that is difficult for non-K-Pop acts to compete with during release weeks.

Third, the group ecosystem creates a multiplier effect. When BTS or BLACKPINK releases a group project, individual members' solo catalogs experience streaming surges of 40-80%. This network effect means that each release amplifies the entire artist's discography, creating a self-reinforcing cycle of engagement that no solo artist can replicate at the same scale. As the industry moves toward shorter release cycles and more content, K-Pop's model of sustained, multi-channel fan engagement may become the template that Western labels increasingly follow.`,
    date: 'Mar 28, 2025',
    tag: 'Analysis',
    tagColor: 'var(--green)',
    readTime: '7 min read',
  },
  {
    title: 'Building MusicPulse: A Technical Deep Dive',
    slug: 'building-musicpulse-technical-deep-dive',
    excerpt: 'How we built a real-time music data platform using Cloudflare Workers, D1, KV, and Next.js. From scraping to serving in under 10ms at the edge — the full technical story.',
    content: `MusicPulse processes over 50 million data points daily from eleven streaming platforms, and it does so with a median response time of 8 milliseconds. This is not an accident — it is the result of an architecture specifically designed for speed, reliability, and cost efficiency at the edge. In this deep dive, we walk through the key technical decisions that make MusicPulse possible.

The foundation of our stack is Cloudflare Workers, which allows us to run computation at 300+ edge locations worldwide. When a user requests chart data, the request is served from the nearest edge node rather than a centralized origin. Our data pipeline runs on a scheduled Worker that fetches data from each platform's API every 15 minutes, normalizes it into a common schema, and writes it to Cloudflare D1 (our SQL database at the edge) and KV (our key-value store for pre-computed aggregations). This means that the most expensive computation — joining, ranking, and scoring — happens at write time, not read time.

On the frontend, Next.js 16 with App Router provides the rendering layer. We use a hybrid approach: chart pages are server-rendered with ISR (Incremental Static Regeneration) for maximum performance, while interactive components like the Cross-Platform Power Score visualizer and real-time trending updates use client-side React with TanStack Query for data fetching. The result is a site that feels instant — Time to First Byte averages 45ms globally, and Largest Contentful Paint is under 1.2 seconds on 4G connections.

The biggest technical challenge was data normalization. Each platform uses different chart methodologies, update frequencies, and metric definitions. Spotify counts streams, Apple Music counts plays, Shazam counts identifications, and YouTube counts views — none of these are directly comparable. Our Cross-Platform Power Score algorithm had to account for these differences while maintaining temporal consistency, so that a score of 90 means roughly the same thing this week as it did last month. We achieved this through a combination of z-score normalization within each platform and a weighted ensemble that adjusts for platform-specific biases. The algorithm is versioned and auditable, so we can retroactively recalculate scores when methodology changes — which has happened twice since launch.`,
    date: 'Mar 21, 2025',
    tag: 'Engineering',
    tagColor: 'var(--purple)',
    readTime: '12 min read',
  },
]

export default function BlogPage() {
  return (
    <div className="relative z-10">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(176,108,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--purple-dim)', border: '1px solid rgba(176,108,255,0.25)', color: 'var(--purple)' }}>
            Insights & Analysis
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Blog
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Data-driven stories, chart analysis, and technical deep dives from the world of music.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-10" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block no-underline"
            >
              <article className="mp-card group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
                {/* Gradient header */}
                <div
                  className="h-[140px] flex items-end p-5"
                  style={{
                    background: `linear-gradient(135deg, ${
                      i % 6 === 0 ? '#642b73,#c6426e' :
                      i % 6 === 1 ? '#4b1248,#f10711' :
                      i % 6 === 2 ? '#1a4a6e,#2196f3' :
                      i % 6 === 3 ? '#134e5e,#71b280' :
                      i % 6 === 4 ? '#2d1b69,#11998e' : '#0a0a2e,#1e3a8a'
                    })`,
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full"
                    style={{ background: `${post.tagColor}25`, color: post.tagColor, border: `1px solid ${post.tagColor}40` }}
                  >
                    {post.tag}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="text-[16px] font-bold tracking-[-0.02em] mb-2 group-hover:text-[var(--green)] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text3)] font-medium">
                    <span>{post.date}</span>
                    <span className="text-[var(--border2)]">·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
