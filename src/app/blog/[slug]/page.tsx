import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticles } from '@/lib/data'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === '_template') return { title: 'Article — MusicPulse' }
  const articles = await getArticles(50)
  const article = articles.find((a) => a.slug === slug)
  if (!article) return { title: 'Article Not Found' }
  return { title: article.title, description: article.summary }
}

export function generateStaticParams() {
  return [{ slug: '_template' }]
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  news:           { bg: 'rgba(67,97,255,0.12)',   text: 'var(--blue)',   border: 'rgba(67,97,255,0.25)' },
  review:         { bg: 'rgba(255,184,48,0.12)',   text: 'var(--gold)',   border: 'rgba(255,184,48,0.25)' },
  feature:        { bg: 'rgba(176,108,255,0.12)',  text: 'var(--purple)', border: 'rgba(176,108,255,0.25)' },
  'chart-analysis': { bg: 'rgba(29,185,84,0.12)',  text: 'var(--green)',  border: 'rgba(29,185,84,0.25)' },
  interview:      { bg: 'rgba(255,45,107,0.12)',   text: 'var(--pink)',   border: 'rgba(255,45,107,0.25)' },
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const articles = await getArticles(50)
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="mp-card p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(255,45,107,0.1)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="#ff2d6b" strokeWidth="1.5" fill="none" />
              <path d="M10 18V13M14 18V10M18 18V15" stroke="#ff2d6b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Article Not Found</h2>
          <p className="text-[14px] text-[var(--text3)] mb-6">
            We couldn&apos;t find this article. It may not be in our database yet, or the link may be incorrect.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--green)', color: '#000' }}>
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const catStyle = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.news
  const paragraphs = article.content.split('\n\n').filter(Boolean)

  return (
    <div className="relative z-10">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(176,108,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text3)] hover:text-[var(--green)] transition-colors mb-8 group">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Blog
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.08em] uppercase mb-5"
            style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>
            {article.category.replace('-', ' ')}
          </span>
          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-[-0.04em] leading-[1.1] mb-5">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-[13px] text-[var(--text3)] font-medium">
            <span>{article.author}</span>
            <span className="text-[var(--border2)]">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="text-[var(--border2)]">·</span>
            <span>{article.source}</span>
          </div>
        </div>
      </div>
      {article.imageUrl && (
        <div className="max-w-[800px] mx-auto px-4 sm:px-7 mb-8">
          <div className="w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      )}
      <div className="max-w-[800px] mx-auto px-4 sm:px-7 pb-16 sm:pb-24">
        <div className="h-px bg-[var(--border)] mb-8 sm:mb-10" />
        <article>
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[15px] sm:text-[16px] text-[var(--text2)] leading-[1.8] font-medium mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}
        </article>
        {(article.relatedArtists.length > 0 || article.relatedSongs.length > 0) && (
          <div className="mt-10 pt-8 border-t border-[var(--border)]">
            <h3 className="text-[14px] font-bold text-[var(--text3)] tracking-[0.08em] uppercase mb-4">Related</h3>
            <div className="flex flex-wrap gap-2">
              {article.relatedArtists.map((artist) => (
                <Link key={artist} href={`/artists/${artist.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-[var(--border2)] text-[var(--text3)] hover:border-[var(--text3)] hover:text-[var(--text2)] transition-all no-underline">
                  {artist}
                </Link>
              ))}
              {article.relatedSongs.map((song) => (
                <Link key={song} href={`/songs/${song.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-[var(--border2)] text-[var(--text3)] hover:border-[var(--text3)] hover:text-[var(--text2)] transition-all no-underline">
                  {song}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 hover:gap-3"
            style={{ background: 'var(--bg3)', color: 'var(--text)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
