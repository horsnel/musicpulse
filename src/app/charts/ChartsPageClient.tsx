'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ChartEntry, Platform, ChartRegion } from '@/types'
import { formatCount, REGION_META } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MiniPlatformIcon, PLATFORM_COLORS } from '@/components/ui/PlatformIcons'

const API_URL = 'https://musicpulse-api.odehebuka48.workers.dev'

const PLATFORMS: Array<{ id: Platform; label: string; color: string }> = [
  { id: 'spotify',   label: 'Spotify Daily Top 200', color: '#1DB954' },
  { id: 'apple',     label: 'Apple Music Top 100',   color: '#fc3c44' },
  { id: 'youtube',   label: 'YouTube Music',          color: '#ff4444' },
  { id: 'deezer',    label: 'Deezer Top Hits',        color: '#A238FF' },
  { id: 'bandcamp',  label: 'Bandcamp Best Selling',  color: '#629AA9' },
  { id: 'audiomack', label: 'Audiomack Trending',     color: '#FFA200' },
  { id: 'shazam',    label: 'Shazam Top 200',         color: '#0e72ed' },
  { id: 'billboard', label: 'Billboard Hot 100',      color: '#e60026' },
]

const REGIONS = ['global', 'nigeria', 'us', 'uk', 'africa', 'brazil', 'korea', 'germany', 'south-africa'] as const

interface Props {
  initialEntries: ChartEntry[]
  countryCharts: Array<{ region: ChartRegion; flag: string; name: string; topSong: string; topArtist: string }>
  initialPlatform: Platform
  initialRegion: ChartRegion
}

export function ChartsPageClient({ initialEntries, countryCharts: initialCountryCharts, initialPlatform, initialRegion }: Props) {
  const searchParams = useSearchParams()
  const urlRegion = searchParams.get('region')
  const validUrlRegion = urlRegion && (REGIONS as readonly string[]).includes(urlRegion) ? urlRegion as ChartRegion : null
  const effectiveInitialRegion = validUrlRegion ?? initialRegion

  const [platform, setPlatform] = useState<Platform>(initialPlatform)
  const [region, setRegion] = useState<ChartRegion>(effectiveInitialRegion)
  const [regionIdx, setRegionIdx] = useState(() => REGIONS.indexOf(effectiveInitialRegion as any) >= 0 ? REGIONS.indexOf(effectiveInitialRegion as any) : 0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [posRange, setPosRange] = useState('Top 50')
  const [entries, setEntries] = useState<ChartEntry[]>(initialEntries)
  const [countryCharts, setCountryCharts] = useState(initialCountryCharts)
  const [loading, setLoading] = useState(false)

  const activePlatform = PLATFORMS.find(p => p.id === platform)!
  const regionMeta = REGION_META[region]

  // Fetch live chart data when platform or region changes
  useEffect(() => {
    async function fetchCharts() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/charts?platform=${platform}&region=${region}&limit=50`, {
          headers: { 'Accept': 'application/json' },
        })
        if (res.ok) {
          const json = await res.json()
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setEntries(json.data)
          }
        }
      } catch {
        // Keep existing data
      }
      setLoading(false)
    }
    fetchCharts()
  }, [platform, region])

  // Fetch country charts on mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(`${API_URL}/api/charts/countries`, {
          headers: { 'Accept': 'application/json' },
        })
        if (res.ok) {
          const json = await res.json()
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setCountryCharts(json.data)
          }
        }
      } catch {
        // Keep existing data
      }
    }
    fetchCountries()
  }, [])

  const cycleRegion = () => {
    const next = (regionIdx + 1) % REGIONS.length
    setRegionIdx(next)
    setRegion(REGIONS[next])
  }

  return (
    <div className="relative z-10">

      {/* Page header */}
      <div
        className="border-b border-[var(--border)] pt-8 sm:pt-10 pb-0"
        style={{ background: 'linear-gradient(180deg,rgba(29,185,84,0.06) 0%,transparent 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 sm:px-3 py-1"
                  style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
                  Updating every hour
                </span>
              </div>
              <h1 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-0.04em] leading-[1]">
                Global Charts
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[var(--text3)] font-medium mt-2">
                Real-time rankings across Spotify, Apple Music, YouTube &amp; more
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Country selector */}
              <button
                onClick={cycleRegion}
                className="flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border2)] rounded-[10px] px-3 sm:px-3.5 py-[9px] text-[12px] sm:text-[13.5px] font-semibold text-[var(--text)] cursor-pointer transition-all hover:border-[var(--text3)] min-w-[160px] sm:min-w-[180px]"
              >
                <span className="text-[16px] sm:text-[18px]">{regionMeta.flag}</span>
                <span className="flex-1">{regionMeta.name}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--text3)]">
                  <polyline points="3,5 7,9 11,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
              {/* Date */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] px-3.5 py-[9px] text-[13px] font-semibold text-[var(--text2)]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="1" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Apr 27, 2025
              </div>
            </div>
          </div>

          {/* Platform tabs */}
          <div className="flex gap-0 overflow-x-auto border-b border-transparent -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={cn(
                  'flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-[-0.01em] border-none cursor-pointer transition-all whitespace-nowrap border-b-2 -mb-px',
                  platform === p.id
                    ? 'text-[var(--text)] border-b-2'
                    : 'text-[var(--text3)] border-transparent hover:text-[var(--text2)]',
                )}
                style={platform === p.id ? { borderBottomColor: p.color, background: 'none' } : { background: 'none' }}
              >
                <span className="flex items-center justify-center"><MiniPlatformIcon platform={p.id} size={14} /></span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 py-5 sm:py-7 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 sm:gap-6 items-start">

        {/* Chart table */}
        <div className="mp-card">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-4 border-b border-[var(--border)] gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${activePlatform.color}18` }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <polyline points="1,12 4.5,7.5 8,10 11.5,5 15,2" stroke={activePlatform.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em]">{activePlatform.label}</div>
                <div className="text-[11px] sm:text-[12px] text-[var(--text3)] font-medium">
                  {regionMeta.name} · Updated 47 min ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Position range filter */}
              <div className="flex gap-0.5 bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[3px]">
                {['Top 50', '51–100', '101–200'].map(r => (
                  <button
                    key={r}
                    onClick={() => setPosRange(r)}
                    className={cn(
                      'px-2 sm:px-3 py-[5px] rounded-md text-[10px] sm:text-[11.5px] font-semibold cursor-pointer border-none transition-all',
                      r === posRange
                        ? 'bg-[var(--bg4)] text-[var(--text)] shadow-sm'
                        : 'text-[var(--text3)] hover:text-[var(--text2)] bg-transparent',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop column headers - hidden on mobile */}
          <div className="hidden md:grid items-center px-[22px] h-9 border-b border-[var(--border)] bg-[var(--bg3)]"
            style={{ gridTemplateColumns: '52px 48px 1fr 100px 110px 80px 90px 50px' }}
          >
            {['#', '', 'Song', 'Streams', 'Peak', 'Weeks', '7d Trend', ''].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] pl-3 first:pl-0 first:text-center">
                {h}
              </div>
            ))}
          </div>

          {/* Desktop rows - hidden on mobile */}
          <div className="hidden md:block">
            {entries.map(entry => {
              const isPlaying = playingId === entry.id
              return (
                <div
                  key={entry.id}
                  onClick={() => setPlayingId(isPlaying ? null : entry.id)}
                  className={cn(
                    'grid items-center px-[22px] h-[66px] border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors',
                    isPlaying ? 'bg-[rgba(29,185,84,0.05)]' : 'hover:bg-[rgba(255,255,255,0.025)]',
                    entry.isNewEntry ? 'bg-[rgba(67,97,255,0.04)]' : '',
                  )}
                  style={{ gridTemplateColumns: '52px 48px 1fr 100px 110px 80px 90px 50px' }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={cn(
                      'text-[16px] font-black tracking-[-0.03em] leading-none',
                      entry.position === 1 ? 'rank-gold' :
                      entry.position === 2 ? 'rank-silver' :
                      entry.position === 3 ? 'rank-bronze' :
                      entry.isNewEntry ? 'text-[var(--blue)]' : 'text-[var(--text3)]',
                    )}>
                      {entry.position}
                    </span>
                    <span className={cn(
                      'text-[10px] font-bold flex items-center gap-0.5',
                      entry.isNewEntry ? 'text-[var(--blue)]' :
                      entry.positionChange > 0 ? 'text-[var(--green)]' :
                      entry.positionChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]',
                    )}>
                      {entry.isNewEntry ? 'NEW' :
                       entry.positionChange > 0 ? `↑${entry.positionChange}` :
                       entry.positionChange < 0 ? `↓${Math.abs(entry.positionChange)}` : '—'}
                    </span>
                  </div>
                  <div
                    className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] border border-[rgba(255,255,255,0.05)] transition-transform mx-1 overflow-hidden"
                    style={{ background: entry.song.albumCoverUrl ? 'var(--bg3)' : (entry.song.artGradient ?? 'var(--bg3)') }}
                  >
                    {entry.song.albumCoverUrl ? (
                      <img src={entry.song.albumCoverUrl} alt={entry.song.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      (entry.song as any).artEmoji ?? '🎵'
                    )}
                  </div>
                  <div className="pl-3.5 min-w-0">
                    <div className={cn(
                      'text-[14px] font-bold tracking-[-0.02em] truncate',
                      isPlaying ? 'text-[var(--green)]' : '',
                    )}>
                      {isPlaying ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="playing-bars" style={{ '--bar-color': 'var(--green)' } as React.CSSProperties} />
                          {entry.song.title}
                        </span>
                      ) : entry.song.title}
                    </div>
                    <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      {entry.song.artistName}
                    </div>
                  </div>
                  <div className="pl-2 text-[13px] font-semibold text-[var(--text2)]">
                    {entry.streams ? formatCount(entry.streams) : '—'}
                  </div>
                  <div className="pl-2">
                    <div className={cn(
                      'text-[13px] font-bold flex items-center gap-1',
                      entry.peakPosition === 1 ? 'text-[var(--gold)]' : 'text-[var(--text2)]',
                    )}>
                      {entry.peakPosition === 1 && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polygon points="5,0.5 6.2,3.6 9.5,3.8 7,6.1 7.9,9.4 5,7.7 2.1,9.4 3,6.1 0.5,3.8 3.8,3.6" fill="currentColor" />
                        </svg>
                      )}
                      #{entry.peakPosition}
                    </div>
                    <div className="text-[10.5px] text-[var(--text3)] font-medium mt-0.5">
                      {entry.weeksOnChart}w on chart
                    </div>
                  </div>
                  <div className="pl-2">
                    <div className="text-[18px] font-black tracking-[-0.03em] text-[var(--text)]">
                      {entry.weeksOnChart}
                    </div>
                    <div className="text-[10px] text-[var(--text3)] font-medium mt-0.5">weeks</div>
                  </div>
                  <div className="pl-1">
                    {entry.sparklineData && (
                      <MiniSparkline data={entry.sparklineData} color={activePlatform.color} />
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[var(--text3)] hover:bg-[var(--bg3)] hover:text-[var(--text2)] transition-all border border-transparent hover:border-[var(--border)]">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polygon points="2,1 10,5.5 2,10" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile rows - simplified layout */}
          <div className="md:hidden">
            {entries.map(entry => {
              const isPlaying = playingId === entry.id
              return (
                <div
                  key={entry.id}
                  onClick={() => setPlayingId(isPlaying ? null : entry.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border-b border-[rgba(28,30,46,0.6)] last:border-0 cursor-pointer transition-colors',
                    isPlaying ? 'bg-[rgba(29,185,84,0.05)]' : 'hover:bg-[rgba(255,255,255,0.025)]',
                    entry.isNewEntry ? 'bg-[rgba(67,97,255,0.04)]' : '',
                  )}
                >
                  {/* Rank */}
                  <div className="flex flex-col items-center gap-0.5 w-7 flex-shrink-0">
                    <span className={cn(
                      'text-[15px] font-black tracking-[-0.03em] leading-none',
                      entry.position === 1 ? 'rank-gold' :
                      entry.position === 2 ? 'rank-silver' :
                      entry.position === 3 ? 'rank-bronze' :
                      entry.isNewEntry ? 'text-[var(--blue)]' : 'text-[var(--text3)]',
                    )}>
                      {entry.position}
                    </span>
                    <span className={cn(
                      'text-[9px] font-bold flex items-center gap-0.5',
                      entry.isNewEntry ? 'text-[var(--blue)]' :
                      entry.positionChange > 0 ? 'text-[var(--green)]' :
                      entry.positionChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]',
                    )}>
                      {entry.isNewEntry ? 'NEW' :
                       entry.positionChange > 0 ? `↑${entry.positionChange}` :
                       entry.positionChange < 0 ? `↓${Math.abs(entry.positionChange)}` : '—'}
                    </span>
                  </div>

                  {/* Art */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border border-[rgba(255,255,255,0.05)] flex-shrink-0 overflow-hidden"
                    style={{ background: entry.song.albumCoverUrl ? 'var(--bg3)' : (entry.song.artGradient ?? 'var(--bg3)') }}
                  >
                    {entry.song.albumCoverUrl ? (
                      <img src={entry.song.albumCoverUrl} alt={entry.song.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      (entry.song as any).artEmoji ?? '🎵'
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      'text-[13px] font-bold tracking-[-0.02em] truncate',
                      isPlaying ? 'text-[var(--green)]' : '',
                    )}>
                      {entry.song.title}
                    </div>
                    <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      {entry.song.artistName}
                    </div>
                  </div>

                  {/* Streams + Peak */}
                  <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                    <span className="text-[12px] font-semibold text-[var(--text2)]">
                      {entry.streams ? formatCount(entry.streams) : '—'}
                    </span>
                    <span className={cn(
                      'text-[10px] font-bold',
                      entry.peakPosition === 1 ? 'text-[var(--gold)]' : 'text-[var(--text3)]',
                    )}>
                      Peak #{entry.peakPosition}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          <div className="flex items-center justify-center gap-2 py-4 sm:py-5 text-[12px] sm:text-[13px] font-semibold text-[var(--text3)] cursor-pointer hover:text-[var(--text2)] transition-colors border-t border-[var(--border)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="3,5 7,9 11,5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Show positions 11–50
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Today's stats */}
          <div className="mp-card">
            <div className="px-4 sm:px-[18px] py-3.5 sm:py-[15px] border-b border-[var(--border)] text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">
              Today&apos;s Chart Stats
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
              {[
                { k: 'Total Streams', v: '1.82B', sub: 'Top 200 combined', color: 'var(--green)' },
                { k: 'New Entries', v: '12', sub: 'This week', color: 'var(--blue)' },
                { k: 'Biggest Mover', v: '+18 ↑', sub: 'Beautiful Things', color: 'var(--pink)' },
                { k: 'Countries', v: '200', sub: 'Charts tracked', color: 'var(--text)' },
              ].map(s => (
                <div key={s.k} className="bg-[var(--bg2)] p-3 sm:p-4">
                  <div className="text-[8px] sm:text-[9px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5">{s.k}</div>
                  <div className="text-[15px] sm:text-[18px] font-black tracking-[-0.03em]" style={{ color: s.color }}>{s.v}</div>
                  <div className="text-[9px] sm:text-[10.5px] text-[var(--text3)] mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Country charts */}
          <div className="mp-card">
            <div className="flex items-center justify-between px-4 sm:px-[18px] py-3.5 sm:py-[15px] border-b border-[var(--border)]">
              <div className="text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Country Charts</div>
              <a href="/charts/countries" className="text-[10px] sm:text-[11.5px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors">
                All 200
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6,2.5 9,5.5 6,8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </a>
            </div>
            <div className="p-1.5 sm:p-2">
              {countryCharts.map(c => (
                <a
                  key={c.region}
                  href={`/charts?region=${c.region}`}
                  className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-2 rounded-[9px] cursor-pointer transition-colors hover:bg-[var(--bg3)] no-underline"
                >
                  <span className="text-[18px] sm:text-[20px] w-[28px] sm:w-[30px] text-center">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] sm:text-[13px] font-semibold tracking-[-0.01em] text-[var(--text)]">{c.name}</div>
                    <div className="text-[10px] sm:text-[11.5px] text-[var(--text3)] font-medium mt-0.5 truncate">
                      #1 {c.topSong}
                    </div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--text3)] flex-shrink-0">
                    <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
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

// Mini sparkline SVG
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  const path = `M${pts.join(' L')}`
  const area = `M${pts.join(' L')} L${w},${h} L0,${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
