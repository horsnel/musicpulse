'use client'

import { useEffect, useState } from 'react'
import { SongDetailClient } from './SongDetailClient'

export function SongSlugResolver() {
  const [slug, setSlug] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2 && pathParts[0] === 'songs') {
      setSlug(pathParts.slice(1).join('/'))
    } else {
      setSlug('')
    }
  }, [])

  if (!mounted || slug === null) {
    return (
      <div className="relative z-10">
        <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(100,43,115,0.2) 0%,rgba(198,66,110,0.1) 40%,transparent 100%)' }} />
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-12 flex flex-col md:grid gap-6 md:gap-10 items-center md:items-end" style={{ gridTemplateColumns: '280px 1fr' }}>
            <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-[16px] sm:rounded-[20px] bg-[var(--bg3)] animate-pulse" />
            <div className="flex flex-col gap-4 w-full">
              <div className="h-4 w-32 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-16 w-3/4 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-6 w-48 rounded bg-[var(--bg3)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (slug === '') {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="mp-card p-10 text-center max-w-md">
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Songs</h2>
          <p className="text-[14px] text-[var(--text3)] mb-6">Browse trending songs on MusicPulse.</p>
          <a href="/trending" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--green)', color: '#000' }}>
            View Trending
          </a>
        </div>
      </div>
    )
  }

  return <SongDetailClient slug={slug} />
}
