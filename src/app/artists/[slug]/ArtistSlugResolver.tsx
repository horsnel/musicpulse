'use client'

import { useEffect, useState } from 'react'
import { ArtistDetailClient } from './ArtistDetailClient'

export function ArtistSlugResolver() {
  const [slug, setSlug] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2 && pathParts[0] === 'artists') {
      setSlug(pathParts.slice(1).join('/'))
    } else {
      setSlug('')
    }
  }, [])

  if (!mounted || slug === null) {
    return (
      <div className="relative z-10">
        <div className="relative overflow-hidden min-h-[520px]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(200,90,0,0.1) 0%,rgba(255,140,26,0.05) 40%,transparent 100%)' }} />
          <div className="relative z-10 max-w-[1280px] mx-auto px-7 pt-[60px] pb-[48px] grid gap-[52px] items-end" style={{ gridTemplateColumns: '320px 1fr' }}>
            <div className="w-[320px] h-[320px] rounded-full bg-[var(--bg3)] animate-pulse" />
            <div className="flex flex-col gap-4">
              <div className="h-4 w-40 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-20 w-3/4 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-6 w-64 rounded bg-[var(--bg3)] animate-pulse" />
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
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Artists</h2>
          <p className="text-[14px] text-[var(--text3)] mb-6">Browse trending artists on MusicPulse.</p>
          <a href="/trending" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--green)', color: '#000' }}>
            View Trending
          </a>
        </div>
      </div>
    )
  }

  return <ArtistDetailClient slug={slug} />
}
