'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCount } from '@/lib/utils'
import { MiniPlatformIcon } from '@/components/ui/PlatformIcons'

const API_URL = 'https://musicpulse-api.odehebuka48.workers.dev'

interface ArtistSong {
  id: string
  songTitle: string
  artistName: string
  platform: string
  rank: number
  metric: number
  metricUnit: string
  badge: string | null
  albumCoverUrl?: string
  artEmoji?: string
  artGradient?: string
}

interface ArtistData {
  slug: string
  name: string
  imageUrl?: string
  songs: ArtistSong[]
  totalSongs: number
}

interface Props {
  slug: string
}

export function ArtistDetailClient({ slug }: Props) {
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchArtist() {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`${API_URL}/api/artists/${slug}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        })
        clearTimeout(timer)

        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }

        const json = await res.json()
        if (json.data) {
          setArtist(json.data)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [slug])

  const accentColor = '#ff8c1a'
  const accentDim = 'rgba(255,140,26,0.1)'

  // Loading skeleton
  if (loading) {
    return (
      <div className="relative z-10">
        <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(200,90,0,0.1) 0%,rgba(255,140,26,0.05) 40%,transparent 100%)' }} />
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-7 pt-8 sm:pt-[60px] pb-8 sm:pb-[48px] flex flex-col md:grid gap-6 md:gap-[52px] items-center md:items-end" style={{ gridTemplateColumns: '280px 1fr' }}>
            <div className="w-[140px] h-[140px] sm:w-[220px] sm:h-[220px] md:w-[280px] md:h-[280px] rounded-full bg-[var(--bg3)] animate-pulse" />
            <div className="flex flex-col gap-4 w-full">
              <div className="h-4 w-40 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-20 w-3/4 rounded bg-[var(--bg3)] animate-pulse" />
              <div className="h-6 w-64 rounded bg-[var(--bg3)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !artist) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
        <div className="mp-card p-8 sm:p-10 text-center max-w-md">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(255,45,107,0.1)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="#ff2d6b" strokeWidth="1.5" fill="none" />
              <path d="M10 18V13M14 18V10M18 18V15" stroke="#ff2d6b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text)] mb-2">Artist Not Found</h2>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] mb-6">
            We couldn&apos;t find data for this artist. They may not be in our database yet, or the link may be incorrect.
          </p>
          <Link href="/trending" className="inline-flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
            style={{ background: 'var(--green)', color: '#000' }}>
            ← Back to Trending
          </Link>
        </div>
      </div>
    )
  }

  const displayName = artist.name || slug.replace(/-/g, ' ')
  const platforms = Array.from(new Set(artist.songs.map(s => s.platform)))

  return (
    <div className="relative z-10">

      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(160deg,rgba(200,90,0,0.22) 0%,rgba(255,140,26,0.12) 30%,rgba(8,9,13,0.2) 70%,var(--bg) 100%)` }} />
        <div className="absolute inset-0 hidden sm:block"
          style={{
            backgroundImage: `linear-gradient(rgba(255,140,26,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,26,0.04) 1px,transparent 1px)`,
            backgroundSize: '48px 48px',
            WebkitMaskImage: 'linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%)',
          }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-7 pt-6 sm:pt-10 md:pt-[60px] pb-6 sm:pb-10 md:pb-[48px] flex flex-col md:grid gap-6 md:gap-[52px] items-center md:items-end"
          style={{ gridTemplateColumns: '280px 1fr' }}>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {/* Spinning ring - hidden on mobile */}
            <div className="hidden md:block absolute inset-[-6px] rounded-full ring-rotate"
              style={{ background: `conic-gradient(from 0deg, ${accentColor}, ${accentColor}80, #1DB954, ${accentColor})` }} />
            <div className="relative z-10 w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[280px] rounded-full flex items-center justify-center text-[56px] sm:text-[80px] md:text-[120px] border-2 sm:border-4 border-[var(--bg)] overflow-hidden"
              style={{ background: artist.imageUrl ? 'var(--bg3)' : 'linear-gradient(135deg,#1a1a08,#2a1a00,#3a2000)', boxShadow: `0 32px 80px rgba(0,0,0,0.7),0 0 60px ${accentDim}` }}>
              {artist.imageUrl ? (
                <img src={artist.imageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                '🎤'
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="w-full text-center md:text-left pb-0 md:pb-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase rounded-full px-2.5 sm:px-3 py-1 mb-3 sm:mb-4"
              style={{ color: accentColor, background: accentDim, border: `1px solid rgba(255,140,26,0.25)` }}>
              🎵 Trending Artist · {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
            </div>

            <h1 className="leading-[0.95] sm:leading-[0.92] mb-2 sm:mb-2.5"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px,7vw,88px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              {displayName.split(' ').map((word, i) => (
                <span key={i} style={{ display: 'block', color: i > 0 ? accentColor : 'var(--text)', fontStyle: i > 0 ? 'italic' : 'normal' }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Song count */}
            <div className="flex items-baseline justify-center md:justify-start gap-2 sm:gap-2.5 mb-4 sm:mb-5">
              <span className="font-black leading-none" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,5vw,52px)', letterSpacing: '-0.03em' }}>
                {artist.totalSongs}
              </span>
              <span className="text-[13px] sm:text-[16px] font-bold text-[var(--text3)] tracking-[-0.01em]">trending songs on MusicPulse</span>
            </div>

            {/* Platform tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-5 sm:mb-7">
              {platforms.map((p, i) => (
                <span key={p} className="text-[11px] sm:text-[12px] font-semibold px-2.5 sm:px-3 py-[4px] sm:py-[5px] rounded-full border cursor-pointer transition-all hover:text-[var(--text2)] flex items-center gap-1 sm:gap-1.5"
                  style={i < 2
                    ? { borderColor: accentColor, color: accentColor, background: accentDim }
                    : { borderColor: 'var(--border2)', color: 'var(--text3)' }}>
                  <MiniPlatformIcon platform={p as any} size={11} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-2.5 flex-wrap">
              <button className="flex items-center gap-2 text-[13px] sm:text-[14px] font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border-none cursor-pointer transition-all hover:brightness-110"
                style={{ background: accentColor, color: '#000' }}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="7.5" y1="4" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Follow Artist
              </button>
              <button className="flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold px-4 sm:px-5 py-2 sm:py-[11px] rounded-full border border-[var(--border2)] text-[var(--text2)] cursor-pointer transition-all hover:border-[var(--text3)] hover:text-[var(--text)] bg-transparent">
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><polygon points="2,1.5 13,7.5 2,13.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>
                Play Top Songs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar - responsive grid */}
      <div className="border-b border-[var(--border)]" style={{ background: 'linear-gradient(180deg,rgba(255,140,26,0.04) 0%,transparent 100%)' }}>
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 border-t border-[var(--border)]">
          {[
            { label: 'Trending Songs', value: String(artist.totalSongs), sub: 'Across all platforms' },
            { label: 'Platforms', value: String(platforms.length), sub: 'Currently charting on', accent: true },
            { label: 'Top Rank', value: artist.songs.length > 0 ? `#${Math.min(...artist.songs.map(s => s.rank))}` : '—', sub: 'Best position' },
            { label: 'Total Metric', value: formatCount(artist.songs.reduce((sum, s) => sum + s.metric, 0)), sub: 'Combined streams/plays' },
          ].map((s, i) => (
            <div key={i} className="bg-[var(--bg)] px-4 sm:px-6 py-3 sm:py-5 border-r border-b sm:border-b-0 border-[var(--border)] last:border-r-0 hover:bg-[var(--bg2)] transition-colors cursor-default">
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1 sm:mb-1.5">{s.label}</div>
              <div className="text-[18px] sm:text-[22px] font-extrabold tracking-[-0.03em]" style={{ color: s.accent || i === 0 ? accentColor : 'var(--text)' }}>{s.value}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 py-5 sm:py-8 flex flex-col lg:grid gap-6 sm:gap-7 items-start" style={{ gridTemplateColumns: '1fr 360px' }}>

        {/* Left */}
        <div className="flex flex-col gap-6 sm:gap-8 w-full">

          {/* Top Songs */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="text-[11px] sm:text-[13px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] flex items-center gap-1.5 sm:gap-2">
                <div className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] rounded-lg flex items-center justify-center" style={{ background: 'var(--green-dim)' }}>
                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><polygon points="2,1.5 11,6.5 2,11.5" stroke="#1DB954" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>
                </div>
                Trending Songs
              </div>
            </div>

            {artist.songs.length === 0 && (
              <div className="mp-card">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-[14px] text-[var(--text3)]">No trending songs found for this artist.</p>
                </div>
              </div>
            )}

            {artist.songs.map((s, idx) => (
              <a key={s.id} href={`/songs/${s.songTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}-${s.artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
                className="flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-[var(--bg3)] no-underline">
                <span className="text-[13px] sm:text-[14px] font-bold w-[20px] sm:w-[22px] text-center flex-shrink-0"
                  style={{ color: s.rank <= 3 ? accentColor : 'var(--text3)' }}>
                  {idx + 1}
                </span>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[7px] sm:rounded-[9px] flex items-center justify-center text-[18px] sm:text-[22px] flex-shrink-0 border border-[var(--border)] overflow-hidden"
                  style={{ background: s.albumCoverUrl ? 'var(--bg3)' : (s.artGradient ?? 'var(--bg3)') }}>
                  {s.albumCoverUrl ? (
                    <img src={s.albumCoverUrl} alt={s.songTitle} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    s.artEmoji || '🎵'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] truncate" style={{ color: s.rank <= 3 ? accentColor : 'var(--text)' }}>{s.songTitle}</div>
                  <div className="text-[10px] sm:text-[12px] text-[var(--text3)] font-medium mt-0.5 flex items-center gap-1 sm:gap-1.5">
                    <MiniPlatformIcon platform={s.platform as any} size={10} />
                    {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)} · #{s.rank}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[12px] sm:text-[13px] font-extrabold tracking-[-0.02em]">{formatCount(s.metric)}</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-[var(--text3)] mt-0.5">{s.metricUnit}</div>
                </div>
                {s.badge && (
                  <span className="hidden sm:flex-shrink-0 sm:inline-flex text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                    style={s.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                      : s.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                      : s.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                      : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                    {s.badge.toUpperCase()}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5 w-full lg:w-auto">

          {/* Artist facts */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)] flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center" style={{ background: accentDim }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polygon points="6,0.8 7.4,4.2 11,4.5 8.4,7 9.2,10.7 6,8.8 2.8,10.7 3.6,7 1,4.5 4.6,4.2" stroke={accentColor} strokeWidth="1" fill="none" strokeLinejoin="round"/></svg>
              </div>
              Artist Facts
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
              {[
                { k: 'Name', v: displayName, accent: true },
                { k: 'Slug', v: artist.slug },
                { k: 'Trending Songs', v: String(artist.totalSongs) },
                { k: 'Platforms', v: platforms.join(', ') || '—' },
              ].map(f => (
                <div key={f.k} className="bg-[var(--bg2)] px-3 sm:px-4 py-3 sm:py-3.5">
                  <div className="text-[8.5px] sm:text-[9.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1 sm:mb-1.5">{f.k}</div>
                  <div className="text-[11px] sm:text-[14px] font-bold tracking-[-0.02em]" style={{ color: f.accent ? accentColor : 'var(--text)', fontSize: f.v.length > 12 ? '11px' : undefined }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Trending On</div>
            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {platforms.map(p => {
                const songsOnPlatform = artist.songs.filter(s => s.platform === p)
                return (
                  <a key={p} href={`/trending/${p}`} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] no-underline transition-all hover:border-[var(--border2)] hover:bg-[var(--bg3)]">
                    <div className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-[8px] sm:rounded-[9px] flex items-center justify-center flex-shrink-0"
                      style={{ background: `rgba(${p === 'spotify' ? '29,185,84' : p === 'apple' ? '252,60,68' : p === 'youtube' ? '255,0,0' : p === 'tiktok' ? '255,45,107' : p === 'melon' ? '0,205,60' : p === 'oricon' ? '204,0,0' : '255,255,255'},0.1)` }}>
                      <MiniPlatformIcon platform={p as any} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] sm:text-[13.5px] font-bold tracking-[-0.01em] text-[var(--text)]">{p.charAt(0).toUpperCase() + p.slice(1)}</div>
                      <div className="text-[10.5px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{songsOnPlatform.length} song{songsOnPlatform.length !== 1 ? 's' : ''} trending</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--text3)] flex-shrink-0">
                      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                    </svg>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Explore More */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Explore More</div>
            <div className="p-3 sm:p-4">
              <Link href="/trending" className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full no-underline"
                style={{ background: accentColor, color: '#000' }}>
                ← Back to Trending
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
