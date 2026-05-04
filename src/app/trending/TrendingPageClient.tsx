'use client'

import { useState, useEffect } from 'react'
import type { TrendingItem, CrossPlatformScore, VelocityItem, GenreHeatRow } from '@/types'
import { formatCount, cn } from '@/lib/utils'
import { PlatformIcon, MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

const API_URL = 'https://musicpulse-api.odehebuka48.workers.dev'
const API_TIMEOUT = 10000

const HEAT_BG = [
  'bg-[var(--bg3)]',
  'bg-[rgba(255,45,107,0.11)]',
  'bg-[rgba(255,45,107,0.24)]',
  'bg-[rgba(255,45,107,0.40)]',
  'bg-[rgba(255,45,107,0.60)]',
  'bg-[rgba(255,45,107,0.82)]',
]

function heatLevel(score: number) {
  if (score >= 90) return 5
  if (score >= 70) return 4
  if (score >= 50) return 3
  if (score >= 30) return 2
  if (score >= 10) return 1
  return 0
}

interface Props {
  tiktok: TrendingItem[]
  twitter: TrendingItem[]
  youtube: TrendingItem[]
  spotify: TrendingItem[]
  apple: TrendingItem[]
  deezer: TrendingItem[]
  soundcloud: TrendingItem[]
  billboard: TrendingItem[]
  crossPlatform: CrossPlatformScore[]
  velocity: VelocityItem[]
  heatmap: GenreHeatRow[]
}

const PLAT_META: Record<string, { label: string; sub: string; color: string; updated: string }> = {
  tiktok:  { label: 'TikTok',          sub: 'Trending Sounds',    color: '#ff2d6b',  updated: '1h ago' },
  twitter: { label: 'X',               sub: 'Music Topics',       color: '#000000',  updated: '3h ago' },
  youtube: { label: 'YouTube Music',   sub: 'Top Music Videos',   color: '#ff3333',  updated: '2h ago' },
  spotify: { label: 'Spotify',         sub: 'Top Streaming',      color: '#1DB954',  updated: '45m ago' },
  apple:   { label: 'Apple Music',     sub: 'Top Plays',          color: '#fc3c44',  updated: '1h ago' },
  deezer:  { label: 'Deezer',          sub: 'Top Charts',         color: '#A238FF',  updated: '1h ago' },
  soundcloud: { label: 'SoundCloud',   sub: 'Trending Tracks',    color: '#FF5500',  updated: '2h ago' },
  billboard:  { label: 'Billboard',    sub: 'Hot 100',            color: '#E60026',  updated: '1d ago' },
}

// Helper to get platform color for rgba backgrounds
function platRgb(platform: string) {
  switch (platform) {
    case 'tiktok':  return '255,45,107'
    case 'twitter': return '200,200,200'
    case 'youtube': return '255,51,51'
    case 'spotify': return '29,185,84'
    case 'apple':   return '252,60,68'
    case 'deezer':  return '162,56,255'
    case 'soundcloud': return '255,85,0'
    case 'billboard':  return '230,0,38'
    default:        return '255,255,255'
  }
}

function platTextColor(platform: string) {
  if (platform === 'twitter') return '#e0e0e0'
  return PLAT_META[platform]?.color ?? '#fff'
}

// ── Client-side API fetch ─────────────────────────────────────
async function fetchFromApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT)
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
    clearTimeout(timer)
    if (!res.ok) return fallback
    const json = await res.json()
    if (json.data && Array.isArray(json.data) && json.data.length > 0) return json.data
    if (json.data && !Array.isArray(json.data) && json.data) return json.data
    return fallback
  } catch {
    return fallback
  }
}

export function TrendingPageClient({ tiktok: initTiktok, twitter: initTwitter, youtube: initYoutube, spotify: initSpotify, apple: initApple, deezer: initDeezer, soundcloud: initSoundcloud, billboard: initBillboard, crossPlatform: initCP, velocity: initVel, heatmap: initHeat }: Props) {
  const [activePlatform, setActivePlatform] = useState<'all' | 'tiktok' | 'twitter' | 'youtube' | 'spotify' | 'apple' | 'deezer' | 'soundcloud' | 'billboard'>('all')
  const [timeRange, setTimeRange] = useState('Now')
  const [liveData, setLiveData] = useState(false)

  // Live data state
  const [tiktok, setTiktok] = useState(initTiktok)
  const [twitter, setTwitter] = useState(initTwitter)
  const [youtube, setYoutube] = useState(initYoutube)
  const [spotify, setSpotify] = useState(initSpotify)
  const [apple, setApple] = useState(initApple)
  const [deezer, setDeezer] = useState(initDeezer)
  const [soundcloud, setSoundcloud] = useState(initSoundcloud)
  const [billboard, setBillboard] = useState(initBillboard)
  const [crossPlatform, setCrossPlatform] = useState(initCP)
  const [velocity, setVelocity] = useState(initVel)
  const [heatmap, setHeatmap] = useState(initHeat)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Fetch live data on mount
  useEffect(() => {
    async function loadLive() {
      try {
        const [
          tTiktok, tTwitter, tYoutube, tSpotify, tApple,
          tDeezer, tSoundcloud, tBillboard,
          tCP, tVel, tHeat,
        ] = await Promise.all([
          fetchFromApi<TrendingItem[]>('/api/trending?platform=tiktok&limit=8', initTiktok),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=twitter&limit=8', initTwitter),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=youtube&limit=8', initYoutube),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=spotify&limit=8', initSpotify),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=apple&limit=8', initApple),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=deezer&limit=8', initDeezer),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=soundcloud&limit=8', initSoundcloud),
          fetchFromApi<TrendingItem[]>('/api/trending?platform=billboard&limit=8', initBillboard),
          fetchFromApi<CrossPlatformScore[]>('/api/trending/cross-platform?limit=5', initCP),
          fetchFromApi<VelocityItem[]>('/api/trending/velocity?limit=5', initVel),
          fetchFromApi<GenreHeatRow[]>('/api/trending/heatmap', initHeat),
        ])

        setTiktok(tTiktok)
        setTwitter(tTwitter)
        setYoutube(tYoutube)
        setSpotify(tSpotify)
        setApple(tApple)
        setDeezer(tDeezer)
        setSoundcloud(tSoundcloud)
        setBillboard(tBillboard)
        setCrossPlatform(tCP)
        setVelocity(tVel)
        setHeatmap(tHeat)
        setLiveData(true)
        setLastUpdated(new Date().toISOString())
      } catch {
        // Fall back to static data
      }
    }
    loadLive()
    // Refresh every 5 minutes
    const interval = setInterval(loadLive, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  // Row 1: TikTok, X, YouTube (3 cols) — Row 2: Spotify, Apple Music, Deezer (3 cols) — Row 3: SoundCloud, Billboard (2 cols)
  const row1 = [
    { platform: 'tiktok' as const, items: tiktok },
    { platform: 'twitter' as const, items: twitter },
    { platform: 'youtube' as const, items: youtube },
  ]
  const row2 = [
    { platform: 'spotify' as const, items: spotify },
    { platform: 'apple' as const, items: apple },
    { platform: 'deezer' as const, items: deezer },
  ]
  const row3 = [
    { platform: 'soundcloud' as const, items: soundcloud },
    { platform: 'billboard' as const, items: billboard },
  ]

  const allItems = [...tiktok.slice(0,3), ...twitter.slice(0,2), ...youtube.slice(0,2), ...spotify.slice(0,2), ...apple.slice(0,2), ...deezer.slice(0,2), ...soundcloud.slice(0,1), ...billboard.slice(0,1)]

  // Format the last updated time
  const updatedLabel = lastUpdated
    ? `Updated ${Math.round((Date.now() - new Date(lastUpdated).getTime()) / 60000)}m ago`
    : 'Loading...'

  return (
    <div className="relative z-10">

      {/* Live gradient bar */}
      <div className="live-gradient-bar" />

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden border-b" style={{ background: 'rgba(255,45,107,0.06)', borderColor: 'rgba(255,45,107,0.12)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 flex items-center h-[34px] sm:h-[38px]">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.18em] uppercase text-[#ff2d6b] pr-3 sm:pr-5 border-r border-[rgba(255,45,107,0.2)] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: liveData ? '#1DB954' : '#ff2d6b' }} />
            {liveData ? 'LIVE' : 'LOADING'}
          </div>
          <div className="flex-1 overflow-hidden pl-3 sm:pl-5">
            <div className="flex items-center gap-4 sm:gap-8 whitespace-nowrap" style={{ animation: 'ticker 30s linear infinite' }}>
              {allItems.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-semibold text-[var(--text2)] cursor-pointer hover:text-[var(--text)] transition-colors">
                  <span className="text-[8px] sm:text-[9px] font-black tracking-[0.1em] uppercase px-1 sm:px-1.5 py-0.5 rounded"
                    style={{
                      background: `rgba(${platRgb(item.platform)},0.15)`,
                      color: platTextColor(item.platform),
                    }}>
                    {item.platform === 'tiktok' ? 'TT' : item.platform === 'twitter' ? 'X' : item.platform === 'spotify' ? 'SP' : item.platform === 'apple' ? 'AM' : item.platform === 'deezer' ? 'DZ' : item.platform === 'soundcloud' ? 'SC' : item.platform === 'billboard' ? 'BB' : 'YT'}
                  </span>
                  <span className="font-black text-[#ff2d6b]">#{item.rank}</span>
                  {item.songTitle} — {item.artistName}
                  <span className="text-[var(--border2)]">·</span>
                  {formatCount(item.metric)} {item.metricUnit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="relative pt-8 sm:pt-[52px] pb-0">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-full pointer-events-none"
          style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,45,107,0.04) 100%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-9 gap-4 sm:gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-[0.1em] uppercase"
                  style={{ background: liveData ? 'rgba(29,185,84,0.1)' : 'rgba(255,45,107,0.1)', border: liveData ? '1px solid rgba(29,185,84,0.25)' : '1px solid rgba(255,45,107,0.25)', color: liveData ? '#1DB954' : '#ff2d6b' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: liveData ? '#1DB954' : '#ff2d6b' }} />
                  {liveData ? 'LIVE DATA' : 'CONNECTING...'}
                </span>
                <span className="text-[10px] sm:text-[12px] font-medium text-[var(--text3)]">{updatedLabel} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h1 className="font-[Space_Grotesk,sans-serif] font-bold tracking-[-0.03em] leading-[0.95]"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(32px, 8vw, 72px)' }}>
                <span className="text-[var(--text)]">TRENDING</span><br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1.5px #ff2d6b' }}>WORLDWIDE</span>
              </h1>
              <p className="text-[12px] sm:text-[14px] text-[var(--text3)] font-medium mt-2 sm:mt-2.5">
                What the world is listening to, sharing, and going crazy over — right now.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 sm:items-end">
              {/* Time range */}
              <div className="flex gap-0.5 bg-[var(--bg3)] border border-[var(--border)] rounded-[10px] p-[3px]">
                {['Now', '24h', '7 days', '30 days'].map(t => (
                  <button key={t} onClick={() => setTimeRange(t)}
                    className={cn('px-2.5 sm:px-4 py-[6px] sm:py-[7px] rounded-lg text-[11px] sm:text-[12px] font-bold cursor-pointer border-none transition-all',
                      t === timeRange ? 'bg-[var(--bg4)] text-[var(--text)] shadow-sm' : 'text-[var(--text3)] bg-transparent hover:text-[var(--text2)]')}>
                    {t}
                  </button>
                ))}
              </div>
              {/* Platform filters */}
              <div className="flex gap-1.5 sm:gap-2 flex-wrap sm:justify-end">
                {[
                  { id: 'all', label: 'All', color: '#ff2d6b' },
                  { id: 'tiktok', label: 'TikTok', color: '#ff2d6b' },
                  { id: 'twitter', label: 'X', color: '#e0e0e0' },
                  { id: 'youtube', label: 'YouTube', color: '#ff3333' },
                  { id: 'spotify', label: 'Spotify', color: '#1DB954' },
                  { id: 'apple', label: 'Apple Music', color: '#fc3c44' },
                  { id: 'deezer', label: 'Deezer', color: '#A238FF' },
                  { id: 'soundcloud', label: 'SoundCloud', color: '#FF5500' },
                  { id: 'billboard', label: 'Billboard', color: '#E60026' },
                ].map(p => (
                  <button key={p.id} onClick={() => setActivePlatform(p.id as any)}
                    className={cn('flex items-center gap-1.5 sm:gap-2 px-3 sm:px-[18px] py-[7px] sm:py-[9px] rounded-full text-[11px] sm:text-[13px] font-bold transition-all border cursor-pointer whitespace-nowrap',
                      activePlatform === p.id
                        ? 'border-current'
                        : 'border-[var(--border2)] text-[var(--text3)] bg-[var(--bg2)] hover:text-[var(--text2)]')}
                    style={activePlatform === p.id ? { color: p.color, background: `${p.color}18`, borderColor: p.color } : {}}>
                    {p.id !== 'all' && <span className="flex items-center justify-center"><MiniPlatformIcon platform={p.id as any} size={14} /></span>}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: TikTok, X, YouTube — 3 columns */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {row1.map(({ platform, items }) => (
          <TrendingColumn key={platform} platform={platform} items={items} />
        ))}
      </div>

      {/* Row 2: Spotify, Apple Music, Deezer — 3 columns */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {row2.map(({ platform, items }) => (
          <TrendingColumn key={platform} platform={platform} items={items} />
        ))}
      </div>

      {/* Row 3: SoundCloud, Billboard — 2 columns */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {row3.map(({ platform, items }) => (
          <TrendingColumn key={platform} platform={platform} items={items} />
        ))}
      </div>

      {/* Bottom: Velocity + Cross-platform — stacks on mobile */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-5 sm:pb-7 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Viral Velocity */}
        <div className="mp-card">
          <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-[17px] border-b border-[var(--border)]">
            <div className="text-[12px] sm:text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2 sm:gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,26,0.1)' }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M7.5 1C5 4 4 6 5.5 8.5 4 8 3 7 3 7c0 3 2 5.5 4.5 6 .5.1 1 .1 1.5 0 4-.8 5.5-4 4.5-7-.5 1.5-1.5 2-1.5 2 1-3-1.5-5.5-4.5-7z" stroke="#ff6b1a" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
              </div>
              <span className="truncate">Viral Velocity — Fastest Rising</span>
            </div>
            <a href="/trending/velocity" className="text-[11px] sm:text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors flex-shrink-0 ml-2">
              All <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
            </a>
          </div>
          <div className="p-1.5 sm:p-2">
            {velocity.map(v => (
              <div key={v.rank} className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--bg3)]">
                <span className="text-[12px] sm:text-[13px] font-bold text-[var(--text3)] w-[16px] sm:w-[18px] text-center flex-shrink-0">{v.rank}</span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-[15px] sm:text-[18px] flex-shrink-0 border border-[var(--border)]" style={{ background: v.artGradient ?? 'var(--bg3)' }}>{v.artEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] sm:text-[13.5px] font-bold tracking-[-0.02em] truncate">{v.songTitle}</div>
                  <div className="text-[10px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5 truncate">{v.artistName} · {v.context}</div>
                </div>
                <div className="w-12 sm:w-14 flex-shrink-0 hidden xs:block">
                  <MiniSparkline data={v.sparkline} />
                </div>
                <div className="text-[13px] sm:text-[15px] font-bold tracking-[-0.02em] w-[46px] sm:w-[52px] text-right flex-shrink-0"
                  style={{ color: v.rank <= 2 ? '#ff6b1a' : v.rank === 3 ? '#f5c842' : '#1DB954' }}>
                  {v.growthPercent === null ? '+∞%' : `+${v.growthPercent}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-platform power */}
        <div className="mp-card">
          <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-[17px] border-b border-[var(--border)]">
            <div className="text-[12px] sm:text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2 sm:gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.1)' }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><polygon points="7.5,1 9.3,5.5 14.2,5.8 10.5,9.2 11.7,14 7.5,11.5 3.3,14 4.5,9.2 0.8,5.8 5.7,5.5" stroke="#f5c842" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>
              </div>
              <span className="truncate">Cross-Platform Power Score</span>
            </div>
            <a href="/trending/cross-platform" className="text-[11px] sm:text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors flex-shrink-0 ml-2">
              Full <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
            </a>
          </div>
          <div className="p-1.5 sm:p-2">
            {crossPlatform.map(cp => (
              <div key={cp.songId} className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--bg3)]">
                <div className="w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] rounded-[8px] sm:rounded-[9px] flex items-center justify-center text-[16px] sm:text-[20px] flex-shrink-0 border border-[var(--border)]" style={{ background: cp.artGradient ?? 'var(--bg3)' }}>{cp.artEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] sm:text-[13.5px] font-bold tracking-[-0.02em] truncate">{cp.songTitle}</div>
                  <div className="text-[10px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{cp.artistName}</div>
                </div>
                <div className="items-center gap-1 flex-shrink-0 hidden sm:flex">
                  {cp.platforms.map(p => (
                    <div key={p} className="w-[22px] h-[22px] rounded-md flex items-center justify-center"
                      style={{ background: `rgba(${platRgb(p)},0.12)` }}>
                      <MiniPlatformIcon platform={p} />
                    </div>
                  ))}
                </div>
                <div className="text-right flex-shrink-0 w-[38px] sm:w-[42px]">
                  <div className="text-[16px] sm:text-[20px] font-bold text-[var(--text)] tracking-[-0.03em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cp.score}</div>
                  <div className="text-[8px] sm:text-[9.5px] font-semibold text-[var(--text3)] tracking-[0.06em] uppercase mt-0.5">Power</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Genre heatmap */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="mp-card">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-[17px] border-b border-[var(--border)]">
            <div className="text-[12px] sm:text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2 sm:gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,45,107,0.1)' }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/></svg>
              </div>
              <span className="truncate">Genre Trend Heatmap — Last 7 Days</span>
            </div>
          </div>
          <div className="px-3 sm:px-6 py-4 sm:py-5 overflow-x-auto">
            <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-5 flex-wrap">
              {['No activity', 'Low', 'Moderate', 'High', 'Very High', 'Viral'].map((label, i) => (
                <div key={label} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[12px] font-semibold text-[var(--text3)]">
                  <div className={cn('w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-[3px]', HEAT_BG[i])} />
                  {label}
                </div>
              ))}
            </div>
            <div className="grid gap-[3px] sm:gap-[5px] min-w-[500px]" style={{ gridTemplateColumns: '70px sm:90px repeat(7, 1fr)' }}>
              <div />
              {days.map(d => (
                <div key={d} className="text-[9px] sm:text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] text-center">{d}</div>
              ))}
              {heatmap.map(row => (
                <>
                  <div key={`${row.genre}-label`} className="text-[10px] sm:text-[11px] font-semibold text-[var(--text3)] flex items-center">{row.genre}</div>
                  {row.days.map((score, di) => {
                    const lvl = heatLevel(score)
                    return (
                      <div key={di}
                        className={cn('h-7 sm:h-9 rounded-md flex items-center justify-center text-[9px] sm:text-[11px] font-bold text-[rgba(255,255,255,0.45)] cursor-pointer transition-all border border-transparent hover:scale-110 hover:border-[rgba(255,255,255,0.15)] hover:text-[rgba(255,255,255,0.9)]', HEAT_BG[lvl])}>
                        {score}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reusable Trending Column ──────────────────────────────────
function TrendingColumn({ platform, items }: { platform: string; items: TrendingItem[] }) {
  const meta = PLAT_META[platform]
  const rgb = platRgb(platform)
  const textColor = platTextColor(platform)

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-[18px] rounded-t-[14px] border border-b-0"
        style={{
          background: `rgba(${rgb},0.05)`,
          borderColor: `rgba(${rgb},0.2)`,
        }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] rounded-[9px] sm:rounded-[11px] flex items-center justify-center"
            style={{ background: `rgba(${rgb},0.12)` }}>
            <PlatformIcon platform={platform as any} />
          </div>
          <div>
            <div className="text-[14px] sm:text-[16px] font-extrabold tracking-[-0.02em]" style={{ color: textColor, fontFamily: 'Space Grotesk, sans-serif' }}>{meta.label}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[var(--text3)] mt-0.5">{meta.sub}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[16px] sm:text-[20px] font-bold" style={{ color: textColor, fontFamily: 'Space Grotesk, sans-serif' }}>Top {items.length}</div>
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--text3)] mt-0.5">{meta.updated}</div>
        </div>
      </div>

      {/* Rows */}
      <div className="rounded-b-[14px] border border-t-0 bg-[var(--bg2)] overflow-hidden"
        style={{ borderColor: `rgba(${rgb},0.15)` }}>
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-[18px] py-2.5 sm:py-3 border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] relative overflow-hidden">
            {/* Rank */}
            <div className="flex flex-col items-center gap-0.5 w-[22px] sm:w-[26px] flex-shrink-0">
              <span className={cn('text-[15px] sm:text-[17px] font-bold leading-none', item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : item.isNew ? 'text-[#3b82f6]' : 'text-[var(--text3)]')}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {item.rank}
              </span>
              <span className={cn('text-[8px] sm:text-[9.5px] font-bold flex items-center gap-0.5',
                item.isNew ? 'text-[#3b82f6]' : item.rankChange > 0 ? 'text-[var(--green)]' : item.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                {item.isNew ? 'NEW' : item.rankChange > 0 ? `↑${item.rankChange}` : item.rankChange < 0 ? `↓${Math.abs(item.rankChange)}` : '—'}
              </span>
            </div>

            {/* Art — album cover if available, else gradient + emoji */}
            <div className="w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] rounded-[8px] sm:rounded-[9px] flex items-center justify-center text-[17px] sm:text-[21px] flex-shrink-0 border border-[rgba(255,255,255,0.05)] overflow-hidden"
              style={{ background: item.albumCoverUrl ? 'var(--bg3)' : (item.artGradient ?? 'var(--bg3)') }}>
              {item.albumCoverUrl ? (
                <img src={item.albumCoverUrl} alt={item.songTitle} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                item.artEmoji
              )}
            </div>

            {/* Info + Badge (inline, no overlap) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] sm:text-[13.5px] font-bold tracking-[-0.02em] truncate">{item.songTitle}</span>
                {item.badge && (
                  <span className="flex-shrink-0 text-[7px] sm:text-[8px] font-black tracking-[0.1em] uppercase px-1 sm:px-1.5 py-0.5 rounded"
                    style={item.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                      : item.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                      : item.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                      : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                    {item.badge === 'hot' ? 'HOT' : item.badge === 'new' ? 'NEW' : item.badge === 'peak' ? 'PEAK' : 'RISING'}
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5 truncate">{item.artistName}</div>
            </div>

            {/* Metric */}
            <div className="text-right flex-shrink-0 pl-3">
              <div className="text-[11px] sm:text-[12.5px] font-extrabold tracking-[-0.02em]" style={{ color: textColor }}>
                {formatCount(item.metric)}
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-[var(--text3)] mt-0.5">{item.metricUnit}</div>
            </div>

            {/* Surge bar */}
            {item.surgePercent && (
              <div className="surge-bar" style={{ background: meta.color, width: `${item.surgePercent}%`, opacity: 0.5 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────
function MiniSparkline({ data }: { data: number[] }) {
  const w = 56, h = 20
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - v * (h - 2) - 1}`)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={`M${pts.join(' L')}`} stroke="#ff6b1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// PlatformIcon and MiniPlatformIcon are now imported from @/components/ui/PlatformIcons
