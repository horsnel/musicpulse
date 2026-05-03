import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'MusicPulse blog — insights, analysis, and stories from the world of music data and charts.',
}

const POSTS = [
  {
    title: 'How Afrobeats Conquered the Global Charts',
    excerpt: 'From Burna Boy to Davido, Afrobeats has become the fastest-growing genre on streaming platforms. We break down the numbers behind the movement and what it means for the future of global music.',
    date: 'Apr 25, 2025',
    tag: 'Analysis',
    tagColor: 'var(--green)',
    readTime: '8 min read',
  },
  {
    title: 'The TikTok Effect: How 30 Seconds Can Make a Hit',
    excerpt: 'A viral TikTok sound can propel an obscure track to the top of Spotify charts in days. We analyze the data behind the biggest TikTok-to-chart pipelines of 2025 and what patterns emerge.',
    date: 'Apr 18, 2025',
    tag: 'Trends',
    tagColor: 'var(--pink)',
    readTime: '6 min read',
  },
  {
    title: 'Cross-Platform Power: Why Chart Dominance Requires More Than Streams',
    excerpt: 'Streaming numbers alone do not tell the full story. Our Cross-Platform Power Score weighs performance across Spotify, Apple Music, YouTube, and social media to identify the true biggest songs.',
    date: 'Apr 11, 2025',
    tag: 'Methodology',
    tagColor: 'var(--blue)',
    readTime: '5 min read',
  },
  {
    title: 'Weekly Digest #47: Die With A Smile Holds Strong',
    excerpt: 'Lady Gaga and Bruno Mars hold the top spot for a 24th consecutive week, while Kendrick Lamar\'s "luther" surges 18 positions. Here is your complete weekly charts breakdown.',
    date: 'Apr 4, 2025',
    tag: 'Digest',
    tagColor: 'var(--gold)',
    readTime: '4 min read',
  },
  {
    title: 'K-Pop\'s Global Streaming Revolution in Numbers',
    excerpt: 'K-Pop groups are no longer just dominating in Asia — they are breaking streaming records worldwide. We look at the data behind the global K-Pop explosion and where it goes next.',
    date: 'Mar 28, 2025',
    tag: 'Analysis',
    tagColor: 'var(--green)',
    readTime: '7 min read',
  },
  {
    title: 'Building MusicPulse: A Technical Deep Dive',
    excerpt: 'How we built a real-time music data platform using Cloudflare Workers, D1, KV, and Next.js. From scraping to serving in under 10ms at the edge — the full technical story.',
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
            <article
              key={i}
              className="mp-card group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
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
          ))}
        </div>
      </div>
    </div>
  )
}
