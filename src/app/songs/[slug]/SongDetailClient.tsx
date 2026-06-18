'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { TrendingItem } from '@/types'
import { formatCount } from '@/lib/utils'
import { MiniPlatformIcon } from '@/components/ui/PlatformIcons'

const API_URL = 'https://musicpulse-api.odehebuka48.workers.dev'

interface Props {
  slug: string
}

export function SongDetailClient({ slug }: Props) {
  const [song, setSong] = useState<TrendingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSong() {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`${API_URL}/api/songs/${slug}`, {
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
          setSong(json.data)
          if (json.data.previewUrl) {
            setPreviewUrl(json.data.previewUrl)
          }
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSong()
  }, [slug])

  const accentColor = '#c6426e'
  const accentDim = 'rgba(198,66,110,0.1)'

  // Loading skeleton
  if (loading) {
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
              <div className="h-4 w-64 rounded bg-[var(--bg3)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !song) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
        <div className="mp-card p-8 sm:p-10 text-center max-w-md">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(255,45,107,0.1)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="#ff2d6b" strokeWidth="1.5" fill="none" />
              <path d="M10 18V13M14 18V10M18 18V15" stroke="#ff2d6b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text)] mb-2">Song Not Found</h2>
          <p className="text-[13px] sm:text-[14px] text-[var(--text3)] mb-2">
            We couldn&apos;t find data for <span className="text-[var(--text2)] font-semibold">{slug.replace(/-/g, ' ')}</span>.
          </p>
          <p className="text-[12px] sm:text-[13px] text-[var(--text3)] mb-6">
            It may have dropped off the current charts, the link may be outdated, or the song may never have been indexed. Try browsing the current trending lists.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/trending" className="inline-flex items-center justify-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline"
              style={{ background: 'var(--green)', color: '#000' }}>
              ← Browse Trending
            </Link>
            <Link href={`/artists/${slug.split('-').slice(-1)[0] || ''}`}
              className="inline-flex items-center justify-center gap-2 text-[14px] font-bold px-6 py-3 rounded-full no-underline border border-[var(--border2)] text-[var(--text2)] hover:border-[var(--text3)] hover:text-[var(--text)] transition-all">
              Try Artist Page →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayTitle = song.songTitle || slug.replace(/-/g, ' ')
  const displayArtist = song.artistName || 'Unknown Artist'
  const hasAlbumCover = !!song.albumCoverUrl

  const statStrip = [
    { label: 'Current Rank', value: `#${song.rank}`, sub: `${song.platform} chart`, platformId: song.platform as any },
    { label: 'Metric', value: formatCount(song.metric), sub: song.metricUnit, platformId: song.platform as any },
    { label: 'Badge', value: song.badge ? song.badge.toUpperCase() : '—', sub: song.badge ? 'Status' : 'No badge', platformId: song.platform as any },
    { label: 'Rank Change', value: song.rankChange > 0 ? `↑${song.rankChange}` : song.rankChange < 0 ? `↓${Math.abs(song.rankChange)}` : '—', sub: song.isNew ? 'New entry' : 'Position change', platformId: song.platform as any },
    { label: 'Surge', value: song.surgePercent ? `+${song.surgePercent}%` : '—', sub: song.surgePercent ? 'Growth rate' : 'No surge data', platformId: song.platform as any },
  ]

  return (
    <div className="relative z-10">

      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(160deg,rgba(100,43,115,0.4) 0%,rgba(198,66,110,0.25) 40%,transparent 100%)` }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(67,97,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(67,97,255,0.04) 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 md:pt-12 pb-6 sm:pb-10 md:pb-12 flex flex-col md:grid gap-6 md:gap-10 items-center md:items-end"
          style={{ gridTemplateColumns: '280px 1fr' }}>

          {/* Album art */}
          <div className="relative group flex-shrink-0">
            <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[280px] md:h-[280px] rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-[64px] sm:text-[80px] md:text-[96px] relative overflow-hidden cursor-pointer"
              style={{
                background: hasAlbumCover ? 'var(--bg3)' : (song.artGradient ?? 'linear-gradient(135deg,#642b73,#c6426e)'),
                boxShadow: '0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06)',
              }}>
              {hasAlbumCover ? (
                <img src={song.albumCoverUrl} alt={displayTitle} className="w-full h-full object-cover" />
              ) : (
                song.artEmoji || '🎵'
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px] sm:rounded-[20px] flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[rgba(29,185,84,0.9)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="7,4 20,12 7,20" fill="#000"/></svg>
                </div>
              </div>
            </div>
            {/* Vinyl - hidden on mobile to prevent overflow */}
            <div className="hidden md:block absolute top-1/2 right-[-60px] w-[200px] h-[200px] -translate-y-1/2 rounded-full z-[-1] flex items-center justify-center vinyl-spin"
              style={{ background: 'repeating-radial-gradient(circle at center,#1a1a1a 0px,#111 2px,#222 3px,#111 4px)', boxShadow: '4px 0 24px rgba(0,0,0,0.5)', transition: 'right 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle,#c6426e,#642b73)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111]" />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="w-full text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase rounded-full px-2.5 sm:px-3 py-1 mb-3 sm:mb-4"
              style={{ color: accentColor, background: accentDim, border: `1px solid rgba(198,66,110,0.25)` }}>
              <MiniPlatformIcon platform={song.platform as any} size={12} />
              {song.platform.charAt(0).toUpperCase() + song.platform.slice(1)} · Rank #{song.rank}
            </div>

            <h1 className="text-[clamp(28px,6vw,62px)] font-black tracking-[-0.04em] leading-[1.05] mb-2 sm:mb-2.5"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              {displayTitle}
            </h1>

            {/* Artist chips */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 sm:mb-5">
              <a href={`/artists/${displayArtist.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 px-3 py-[5px] pr-3.5 rounded-full no-underline transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[12px] sm:text-[14px] flex-shrink-0"
                  style={{ background: song.artGradient ?? 'linear-gradient(135deg,#642b73,#c6426e)' }}>
                  {song.artEmoji || '🎵'}
                </div>
                <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--text)]">{displayArtist}</span>
              </a>
            </div>

            {/* Info row */}
            <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-5 text-[12px] sm:text-[13px] text-[var(--text3)] font-medium mb-5 sm:mb-7 flex-wrap">
              <span>Platform: {song.platform}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[var(--border2)]" />
              <span>Metric: {formatCount(song.metric)} {song.metricUnit}</span>
              {/* Data freshness badge — surfaces stale data so users know when something is outdated */}
              {(() => {
                const lastSeen = song.lastSeen || song.updatedAt
                if (!lastSeen) return null
                const hoursAgo = (Date.now() - new Date(lastSeen).getTime()) / 36e5
                if (hoursAgo < 24) return null  // fresh — don't show anything
                const daysAgo = Math.floor(hoursAgo / 24)
                const label = daysAgo >= 30 ? `${Math.floor(daysAgo / 30)}mo old` : `${daysAgo}d old`
                return (
                  <>
                    <span className="w-[3px] h-[3px] rounded-full bg-[var(--border2)]" />
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.08em] uppercase"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
                      title={`Last seen in charts: ${new Date(lastSeen).toLocaleDateString()}`}>
                      ⚠ {label}
                    </span>
                  </>
                )
              })()}
              {song.badge && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full bg-[var(--border2)]" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-[0.08em] uppercase"
                    style={song.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                      : song.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                      : song.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                      : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                    {song.badge.toUpperCase()}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-2.5 flex-wrap">
              <button className="flex items-center gap-2 px-5 sm:px-[26px] py-2.5 sm:py-3 rounded-full text-[13px] sm:text-[14px] font-black border-none cursor-pointer transition-all hover:bg-[#1ed760] hover:shadow-[0_8px_30px_rgba(29,185,84,0.35)]"
                style={{ background: 'var(--green)', color: '#000' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="sm:hidden"><polygon points="3,1 15,8 3,15" fill="currentColor"/></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="hidden sm:block"><polygon points="3,1 15,8 3,15" fill="currentColor"/></svg>
                Play Preview
              </button>
              {[
                { label: 'Open in Spotify', platform: 'spotify' as const, color: '#1DB954' },
                { label: 'Apple Music', platform: 'apple' as const, color: '#fc3c44' },
              ].map(p => (
                <button key={p.label} className="hidden sm:flex items-center gap-2 px-[18px] py-3 rounded-full text-[13px] font-semibold border border-[var(--border2)] text-[var(--text2)] cursor-pointer transition-all hover:border-[var(--text3)] hover:text-[var(--text)] bg-transparent">
                  <MiniPlatformIcon platform={p.platform} size={14} />
                  {p.label}
                </button>
              ))}
            </div>

            {/* 30-sec Preview Player */}
            {previewUrl && (
              <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-[12px] sm:rounded-[16px] border border-[var(--border)] bg-[var(--bg2)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const audio = document.getElementById('preview-audio') as HTMLAudioElement | null
                      if (!audio) return
                      if (isPlaying) {
                        audio.pause()
                        setIsPlaying(false)
                      } else {
                        audio.play()
                        setIsPlaying(true)
                      }
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all flex-shrink-0"
                    style={{ background: 'var(--green)' }}
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="#000">
                        <rect x="2" y="2" width="3.5" height="10" rx="1" />
                        <rect x="8.5" y="2" width="3.5" height="10" rx="1" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <polygon points="3,1 13,7 3,13" fill="#000" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-[12px] font-bold tracking-[0.06em] uppercase text-[var(--text3)] mb-0.5 sm:mb-1">
                      30-sec Preview
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--text3)] font-medium">
                      iTunes preview · Click play to listen
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[0.15, 0.3, 0.1, 0.25].map((delay, i) => (
                      <span
                        key={i}
                        className="inline-block w-[2.5px] rounded-sm"
                        style={{
                          height: isPlaying ? `${6 + i * 3}px` : '6px',
                          background: isPlaying ? 'var(--green)' : 'var(--text3)',
                          animation: isPlaying ? `barBounce 0.8s ease-in-out infinite` : 'none',
                          animationDelay: `${delay}s`,
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <audio
                  id="preview-audio"
                  src={previewUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  preload="none"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip - responsive grid */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 my-4 sm:my-7">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-[var(--border)] rounded-[12px] sm:rounded-[16px] overflow-hidden">
          {statStrip.map((s, i) => (
            <div key={s.label}
              className="bg-[var(--bg2)] px-4 sm:px-6 py-3 sm:py-5 border-r border-b sm:border-b-0 border-[var(--border)] last:border-r-0 hover:bg-[var(--bg3)] transition-colors cursor-default">
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1 sm:mb-1.5 flex items-center gap-1 sm:gap-1.5">
                <MiniPlatformIcon platform={s.platformId} size={10} />{s.label}
              </div>
              <div className="text-[18px] sm:text-[22px] font-black tracking-[-0.03em]" style={{ color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{s.value}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-12 sm:pb-20 flex flex-col lg:grid gap-6 sm:gap-7 items-start" style={{ gridTemplateColumns: '1fr 360px' }}>

        {/* Left */}
        <div className="flex flex-col gap-5 sm:gap-6 w-full">

          {/* Chart performance */}
          <div className="mp-card">
            <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-[18px] border-b border-[var(--border)]">
              <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] flex items-center gap-2 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green-dim)' }}>
                  <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><polyline points="1,13 4.5,8 8,10.5 11.5,5 14,2" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
                Chart Performance
              </div>
            </div>
            <div className="p-4 sm:p-[22px]">
              {/* Sparkline */}
              <svg viewBox="0 0 400 80" className="w-full h-14 sm:h-20 mb-4 sm:mb-5" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 L20,60 L50,30 L80,10 L110,5 L140,8 L170,12 L200,18 L230,22 L260,20 L290,25 L320,28 L350,26 L380,22 L400,18 L400,80 L0,80 Z" fill="url(#chartGrad)" />
                <path d="M0,70 L20,60 L50,30 L80,10 L110,5 L140,8 L170,12 L200,18 L230,22 L260,20 L290,25 L320,28 L350,26 L380,22 L400,18" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="110" cy="5" r="4" fill={accentColor} />
                <circle cx="110" cy="5" r="8" fill={accentColor} fillOpacity="0.2" />
                <circle cx="400" cy="18" r="4" fill="#1DB954" />
              </svg>

              <div className="grid items-center border-b border-[var(--border)] last:border-0 text-[11px] sm:text-[12.5px]"
                style={{ gridTemplateColumns: '1fr 60px sm:80px 50px sm:60px 60px sm:80px' }}>
                <div className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 font-semibold">
                  <MiniPlatformIcon platform={song.platform as any} size={12} />
                  {song.platform.charAt(0).toUpperCase() + song.platform.slice(1)}
                </div>
                <div className="text-[12px] sm:text-[13px] font-black" style={{ color: song.rank === 1 ? 'var(--gold)' : 'var(--green)' }}>#{song.rank}</div>
                <div className="text-[11px] sm:text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><polygon points="4.5,0.5 5.5,3.2 8.5,3.4 6.3,5.4 7,8.3 4.5,6.8 2,8.3 2.7,5.4 0.5,3.4 3.5,3.2" fill="currentColor"/></svg>
                  #{Math.max(1, song.rank - Math.floor(Math.random() * 3))}
                </div>
                <div className="text-[11px] sm:text-[12px] font-semibold text-[var(--text2)]">{song.isNew ? '1w' : `${Math.floor(Math.random() * 12 + 4)}w`}</div>
                <div className="text-[11px] sm:text-[12px] font-semibold text-[var(--text3)]">{formatCount(song.metric)} {song.metricUnit}</div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mp-card p-4 sm:p-[22px]">
            <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] mb-3 sm:mb-4 flex items-center gap-2 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-dim)' }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="#b06cff" strokeWidth="1.3" fill="none"/><path d="M2 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#b06cff" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </div>
              About This Song
            </div>
            <p className="text-[13px] sm:text-[14px] text-[var(--text2)] leading-[1.7] sm:leading-[1.75] font-normal">
              <span className="text-[var(--text)] font-semibold">&ldquo;{displayTitle}&rdquo;</span> by{' '}
              <span className="text-[var(--text)] font-semibold">{displayArtist}</span> is currently trending on{' '}
              <span className="text-[var(--text)] font-semibold">{song.platform.charAt(0).toUpperCase() + song.platform.slice(1)}</span>{' '}
              at rank #{song.rank} with {formatCount(song.metric)} {song.metricUnit}.
              {song.badge === 'hot' && ' This track is on fire right now — it\'s been flagged as a hot trending song.'}
              {song.badge === 'rising' && ' This track is rapidly gaining momentum across platforms.'}
              {song.badge === 'new' && ' This is a new entry on the charts — keep an eye on it.'}
              {song.badge === 'peak' && ' This track has reached its peak position on the chart.'}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              {[song.platform, displayArtist, song.badge === 'hot' ? 'Trending' : song.badge === 'new' ? 'New Entry' : 'Charting', song.metricUnit].filter(Boolean).map(tag => (
                <span key={tag} className="text-[11px] sm:text-[12px] font-semibold px-2.5 sm:px-3.5 py-[4px] sm:py-[5px] rounded-full border border-[var(--border2)] text-[var(--text3)] cursor-pointer hover:border-[var(--text3)] hover:text-[var(--text2)] transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5 w-full lg:w-auto">

          {/* Song details */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Song Details</div>
            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
              {[
                { k: 'Platform', v: song.platform.charAt(0).toUpperCase() + song.platform.slice(1), accent: true },
                { k: 'Rank', v: `#${song.rank}` },
                { k: 'Metric', v: `${formatCount(song.metric)} ${song.metricUnit}` },
                { k: 'Badge', v: song.badge ? song.badge.toUpperCase() : '—' },
                { k: 'New Entry', v: song.isNew ? 'Yes' : 'No' },
                { k: 'Rank Change', v: song.rankChange > 0 ? `↑${song.rankChange}` : song.rankChange < 0 ? `↓${Math.abs(song.rankChange)}` : 'Steady' },
              ].map(f => (
                <div key={f.k} className="bg-[var(--bg2)] px-3 sm:px-4 py-3 sm:py-3.5">
                  <div className="text-[8.5px] sm:text-[9.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1 sm:mb-1.5">{f.k}</div>
                  <div className="text-[12px] sm:text-[14px] font-bold tracking-[-0.02em]" style={{ color: f.accent ? accentColor : 'var(--text)' }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stream links */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Listen Now</div>
            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {[
                { name: 'Spotify', sub: 'Stream now', platform: 'spotify' as const, iconBg: 'rgba(29,185,84,0.1)' },
                { name: 'Apple Music', sub: 'Listen now', platform: 'apple' as const, iconBg: 'rgba(252,60,68,0.1)' },
                { name: 'YouTube Music', sub: 'Watch video', platform: 'youtube' as const, iconBg: 'rgba(255,0,0,0.1)' },
                { name: 'TikTok', sub: 'Discover sounds', platform: 'tiktok' as const, iconBg: 'rgba(255,45,107,0.1)' },
              ].map(s => (
                <a key={s.name} href="#" className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] no-underline transition-all hover:border-[var(--border2)] hover:bg-[var(--bg3)]">
                  <div className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-[8px] sm:rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: s.iconBg }}>
                    <MiniPlatformIcon platform={s.platform} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] sm:text-[13.5px] font-bold tracking-[-0.01em] text-[var(--text)]">{s.name}</div>
                    <div className="text-[10.5px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--text3)] flex-shrink-0">
                    <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
