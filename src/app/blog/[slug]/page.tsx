import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS } from '../page'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS.find((p) => p.slug === slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) notFound()

  const paragraphs = post.content.split('\n\n').filter(Boolean)

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(176,108,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 relative z-10">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text3)] hover:text-[var(--green)] transition-colors mb-8 group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Blog
          </Link>

          {/* Tag */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.08em] uppercase mb-5"
            style={{ background: `${post.tagColor}18`, color: post.tagColor, border: `1px solid ${post.tagColor}30` }}
          >
            {post.tag}
          </span>

          {/* Title */}
          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black tracking-[-0.04em] leading-[1.1] mb-5">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[13px] text-[var(--text3)] font-medium">
            <span>{post.date}</span>
            <span className="text-[var(--border2)]">·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-7 pb-16 sm:pb-24">
        <div className="h-px bg-[var(--border)] mb-8 sm:mb-10" />

        <article className="prose-custom">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="text-[15px] sm:text-[16px] text-[var(--text2)] leading-[1.8] font-medium mb-6 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* Bottom navigation */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 hover:gap-3"
            style={{ background: 'var(--bg3)', color: 'var(--text)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
