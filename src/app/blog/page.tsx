import type { Metadata } from 'next'
import { getArticles } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MusicPulse Blog',
  description: 'Latest music news, chart analysis, and reviews — data-driven stories from the world of music.',
}

// Blog listing page (at /blog)
export default async function BlogListPage() {
  const articles = await getArticles(20)

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(176,108,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--purple-dim)', border: '1px solid rgba(176,108,255,0.25)', color: 'var(--purple)' }}>
            Insights & Analysis
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            MusicPulse Blog
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Latest music news, chart analysis, and reviews
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-10" />

        {articles.length === 0 ? (
          <div className="text-center py-16 text-[var(--text3)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="8" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] font-medium">Loading articles...</p>
            <p className="text-[12px] mt-1">Articles refresh from live sources.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const catStyle = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.news
              return (
                <Link
                  key={article.id}
                  href={article.sourceUrl || `/blog/${article.slug}`}
                  className="block no-underline"
                  target={article.sourceUrl ? '_blank' : undefined}
                  rel={article.sourceUrl ? 'noopener noreferrer' : undefined}
                >
                  <article className="mp-card group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
                    <div
                      className="h-[160px] flex items-end p-5 bg-cover bg-center relative overflow-hidden"
                      style={article.imageUrl ? { backgroundImage: `url(${article.imageUrl})` } : {
                        background: `linear-gradient(135deg, #642b73, #c6426e)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span
                        className="relative text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full"
                        style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
                      >
                        {article.category.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-[16px] font-bold tracking-[-0.02em] mb-2 group-hover:text-[var(--green)] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium mb-3 line-clamp-3 flex-1">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text3)] font-medium">
                        <span>{article.author}</span>
                        <span className="text-[var(--border2)]">·</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  news:           { bg: 'rgba(67,97,255,0.12)',   text: 'var(--blue)',   border: 'rgba(67,97,255,0.25)' },
  review:         { bg: 'rgba(255,184,48,0.12)',   text: 'var(--gold)',   border: 'rgba(255,184,48,0.25)' },
  feature:        { bg: 'rgba(176,108,255,0.12)',  text: 'var(--purple)', border: 'rgba(176,108,255,0.25)' },
  'chart-analysis': { bg: 'rgba(29,185,84,0.12)',  text: 'var(--green)',  border: 'rgba(29,185,84,0.25)' },
  interview:      { bg: 'rgba(255,45,107,0.12)',   text: 'var(--pink)',   border: 'rgba(255,45,107,0.25)' },
}
