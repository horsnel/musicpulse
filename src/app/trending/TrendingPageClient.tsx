'use client'

import { useState } from 'react'
import type { TrendingItem, CrossPlatformScore, VelocityItem, GenreHeatRow } from '@/types'
import { formatCount, cn } from '@/lib/utils'

const HEAT_CLASSES = ['h0', 'h1', 'h2', 'h3', 'h4', 'h5']
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
  crossPlatform: CrossPlatformScore[]
  velocity: VelocityItem[]
  heatmap: GenreHeatRow[]
}

const PLAT_META = {
  tiktok:  { label: 'TikTok',      sub: 'Trending Sounds',    color: '#ff2d6b',  updated: '1h ago' },
  twitter: { label: 'X / Twitter', sub: 'Music Topics',       color: '#3b82f6',  updated: '3h ago' },
  youtube: { label: 'YouTube Music',sub: 'Top Music Videos',   color: '#ff3333',  updated: '2h ago' },
}

export function TrendingPageClient({ tiktok, twitter, youtube, crossPlatform, velocity, heatmap }: Props) {
  const [activePlatform, setActivePlatform] = useState<'all' | 'tiktok' | 'twitter' | 'youtube' | 'spotify'>('all')
  const [timeRange, setTimeRange] = useState('Now')

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  return (
    <div className="relative z-10">

      {/* Live gradient bar */}
      <div className="live-gradient-bar" />

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden border-b" style={{ background: 'rgba(255,45,107,0.06)', borderColor: 'rgba(255,45,107,0.12)' }}>
        <div className="max-w-[1280px] mx-auto px-7 flex items-center h-[38px]">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] uppercase text-[#ff2d6b] pr-5 border-r border-[rgba(255,45,107,0.2)] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#ff2d6b' }} />
            LIVE
          </div>
          <div className="flex-1 overflow-hidden pl-5">
            <div className="flex items-center gap-8 whitespace-nowrap" style={{ animation: 'ticker 30s linear infinite' }}>
              {[...tiktok.slice(0,3), ...twitter.slice(0,2), ...youtube.slice(0,3)].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--text2)] cursor-pointer hover:text-[var(--text)] transition-colors">
                  <span className="text-[9px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: `rgba(${item.platform === 'tiktok' ? '255,45,107' : item.platform === 'twitter' ? '59,130,246' : '255,51,51'},0.15)`,
                      color: item.platform === 'tiktok' ? '#ff2d6b' : item.platform === 'twitter' ? '#3b82f6' : '#ff3333',
                    }}>
                    {item.platform === 'tiktok' ? 'TT' : item.platform === 'twitter' ? 'TW' : 'YT'}
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
      <div className="relative pt-[52px] pb-0">
        <div className="absolute top-0 right-0 w-[500px] h-full pointer-events-none"
          style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,45,107,0.04) 100%)' }} />
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="flex items-end justify-between mb-9 gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black tracking-[0.1em] uppercase"
                  style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.25)', color: '#ff2d6b' }}>
                  <span className="ld w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#ff2d6b' }} />
                  LIVE NOW
                </span>
                <span className="text-[12px] font-medium text-[var(--text3)]">Updating every 2h · Apr 27, 2025</span>
              </div>
              <h1 className="font-[Space_Grotesk,sans-serif] font-bold tracking-[-0.03em] leading-[0.95]"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(40px, 6vw, 72px)' }}>
                <span className="text-[var(--text)]">TRENDING</span><br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1.5px #ff2d6b' }}>WORLDWIDE</span>
              </h1>
              <p className="text-[14px] text-[var(--text3)] font-medium mt-2.5">
                What the world is listening to, sharing, and going crazy over — right now.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-end">
              {/* Time range */}
              <div className="flex gap-0.5 bg-[var(--bg3)] border border-[var(--border)] rounded-[10px] p-[3px]">
                {['Now', '24h', '7 days', '30 days'].map(t => (
                  <button key={t} onClick={() => setTimeRange(t)}
                    className={cn('px-4 py-[7px] rounded-lg text-[12px] font-bold cursor-pointer border-none transition-all',
                      t === timeRange ? 'bg-[var(--bg4)] text-[var(--text)] shadow-sm' : 'text-[var(--text3)] bg-transparent hover:text-[var(--text2)]')}>
                    {t}
                  </button>
                ))}
              </div>
              {/* Platform filters */}
              <div className="flex gap-2 flex-wrap justify-end">
                {[
                  { id: 'all', label: 'All', color: '#ff2d6b' },
                  { id: 'tiktok', label: 'TikTok', color: '#ff2d6b' },
                  { id: 'twitter', label: 'Twitter', color: '#3b82f6' },
                  { id: 'youtube', label: 'YouTube', color: '#ff3333' },
                  { id: 'spotify', label: 'Spotify', color: '#1DB954' },
                ].map(p => (
                  <button key={p.id} onClick={() => setActivePlatform(p.id as any)}
                    className={cn('flex items-center gap-2 px-[18px] py-[9px] rounded-full text-[13px] font-bold transition-all border cursor-pointer whitespace-nowrap',
                      activePlatform === p.id
                        ? 'border-current'
                        : 'border-[var(--border2)] text-[var(--text3)] bg-[var(--bg2)] hover:text-[var(--text2)]')}
                    style={activePlatform === p.id ? { color: p.color, background: `${p.color}18`, borderColor: p.color } : {}}>
                    {p.id !== 'all' && <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-col trending */}
      <div className="max-w-[1280px] mx-auto px-7 pb-5 grid grid-cols-3 gap-5">
        {([
          { platform: 'tiktok' as const, items: tiktok },
          { platform: 'twitter' as const, items: twitter },
          { platform: 'youtube' as const, items: youtube },
        ]).map(({ platform, items }) => {
          const meta = PLAT_META[platform]
          return (
            <div key={platform} className="flex flex-col">
              {/* Column header */}
              <div className="flex items-center justify-between px-[22px] py-[18px] rounded-t-[14px] border border-b-0"
                style={{
                  background: `rgba(${platform === 'tiktok' ? '255,45,107' : platform === 'twitter' ? '59,130,246' : '255,51,51'},0.05)`,
                  borderColor: `rgba(${platform === 'tiktok' ? '255,45,107' : platform === 'twitter' ? '59,130,246' : '255,51,51'},0.2)`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center"
                    style={{ background: `rgba(${platform === 'tiktok' ? '255,45,107' : platform === 'twitter' ? '59,130,246' : '255,51,51'},0.12)` }}>
                    <PlatformIcon platform={platform} />
                  </div>
                  <div>
                    <div className="text-[16px] font-extrabold tracking-[-0.02em]" style={{ color: meta.color, fontFamily: 'Space Grotesk, sans-serif' }}>{meta.label}</div>
                    <div className="text-[11px] font-medium text-[var(--text3)] mt-0.5">{meta.sub}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-bold" style={{ color: meta.color, fontFamily: 'Space Grotesk, sans-serif' }}>Top {items.length}</div>
                  <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--text3)] mt-0.5">{meta.updated}</div>
                </div>
              </div>

              {/* Rows */}
              <div className="rounded-b-[14px] border border-t-0 bg-[var(--bg2)] overflow-hidden"
                style={{ borderColor: `rgba(${platform === 'tiktok' ? '255,45,107' : platform === 'twitter' ? '59,130,246' : '255,51,51'},0.15)` }}>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-[18px] py-3 border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.025)] relative overflow-hidden">
                    {/* Rank */}
                    <div className="flex flex-col items-center gap-0.5 w-[26px] flex-shrink-0">
                      <span className={cn('text-[17px] font-bold leading-none', item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : item.isNew ? 'text-[var(--tw,#3b82f6)]' : 'text-[var(--text3)]')}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {item.rank}
                      </span>
                      <span className={cn('text-[9.5px] font-bold flex items-center gap-0.5',
                        item.isNew ? 'text-[#3b82f6]' : item.rankChange > 0 ? 'text-[var(--green)]' : item.rankChange < 0 ? 'text-[var(--pink)]' : 'text-[var(--text3)]')}>
                        {item.isNew ? 'NEW' : item.rankChange > 0 ? `↑${item.rankChange}` : item.rankChange < 0 ? `↓${Math.abs(item.rankChange)}` : '—'}
                      </span>
                    </div>

                    {/* Art */}
                    <div className="w-[42px] h-[42px] rounded-[9px] flex items-center justify-center text-[21px] flex-shrink-0 border border-[rgba(255,255,255,0.05)]"
                      style={{ background: item.artGradient ?? 'var(--bg3)' }}>
                      {item.artEmoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold tracking-[-0.02em] truncate">{item.songTitle}</div>
                      <div className="text-[11.5px] text-[var(--text3)] font-medium mt-0.5 truncate">{item.artistName}</div>
                    </div>

                    {/* Metric */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-[12.5px] font-extrabold tracking-[-0.02em]" style={{ color: meta.color }}>
                        {formatCount(item.metric)}
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text3)] mt-0.5">{item.metricUnit}</div>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-[9px] right-[10px] text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                        style={item.badge === 'hot' ? { background: 'rgba(255,107,26,0.15)', color: '#ff6b1a' }
                          : item.badge === 'new' ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }
                          : item.badge === 'peak' ? { background: 'rgba(245,200,66,0.12)', color: '#f5c842' }
                          : { background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>
                        {item.badge === 'hot' ? '🔥 HOT' : item.badge === 'new' ? '🆕 NEW' : item.badge === 'peak' ? '👑 PEAK' : '↑ RISING'}
                      </div>
                    )}

                    {/* Surge bar */}
                    {item.surgePercent && (
                      <div className="surge-bar" style={{ background: meta.color, width: `${item.surgePercent}%`, opacity: 0.5 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom: Velocity + Cross-platform */}
      <div className="max-w-[1280px] mx-auto px-7 pb-7 grid grid-cols-2 gap-5">
        {/* Viral Velocity */}
        <div className="mp-card">
          <div className="flex items-center justify-between px-[22px] py-[17px] border-b border-[var(--border)]">
            <div className="text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,26,0.1)' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1C5 4 4 6 5.5 8.5 4 8 3 7 3 7c0 3 2 5.5 4.5 6 .5.1 1 .1 1.5 0 4-.8 5.5-4 4.5-7-.5 1.5-1.5 2-1.5 2 1-3-1.5-5.5-4.5-7z" stroke="#ff6b1a" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
              </div>
              Viral Velocity — Fastest Rising
            </div>
            <a href="/trending/velocity" className="text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors">
              All movers <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
            </a>
          </div>
          <div className="p-2">
            {velocity.map(v => (
              <div key={v.rank} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--bg3)]">
                <span className="text-[13px] font-bold text-[var(--text3)] w-[18px] text-center flex-shrink-0">{v.rank}</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0 border border-[var(--border)]" style={{ background: v.artGradient ?? 'var(--bg3)' }}>{v.artEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold tracking-[-0.02em] truncate">{v.songTitle}</div>
                  <div className="text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{v.artistName} · {v.context}</div>
                </div>
                {/* Sparkline */}
                <div className="w-14 flex-shrink-0">
                  <MiniSparkline data={v.sparkline} />
                </div>
                <div className="text-[15px] font-bold tracking-[-0.02em] w-[52px] text-right flex-shrink-0"
                  style={{ color: v.rank <= 2 ? '#ff6b1a' : v.rank === 3 ? '#f5c842' : '#1DB954' }}>
                  {v.growthPercent === null ? '+∞%' : `+${v.growthPercent}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-platform power */}
        <div className="mp-card">
          <div className="flex items-center justify-between px-[22px] py-[17px] border-b border-[var(--border)]">
            <div className="text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.1)' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polygon points="7.5,1 9.3,5.5 14.2,5.8 10.5,9.2 11.7,14 7.5,11.5 3.3,14 4.5,9.2 0.8,5.8 5.7,5.5" stroke="#f5c842" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>
              </div>
              Cross-Platform Power Score
            </div>
            <a href="/trending/cross-platform" className="text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors">
              Full ranking <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
            </a>
          </div>
          <div className="p-2">
            {crossPlatform.map(cp => (
              <div key={cp.songId} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--bg3)]">
                <div className="w-[42px] h-[42px] rounded-[9px] flex items-center justify-center text-[20px] flex-shrink-0 border border-[var(--border)]" style={{ background: cp.artGradient ?? 'var(--bg3)' }}>{cp.artEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold tracking-[-0.02em] truncate">{cp.songTitle}</div>
                  <div className="text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{cp.artistName}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {cp.platforms.map(p => (
                    <div key={p} className="w-[22px] h-[22px] rounded-md flex items-center justify-center"
                      style={{ background: p === 'tiktok' ? 'rgba(255,45,107,0.12)' : p === 'twitter' ? 'rgba(59,130,246,0.12)' : p === 'youtube' ? 'rgba(255,51,51,0.12)' : 'rgba(29,185,84,0.12)' }}>
                      <MiniPlatformIcon platform={p} />
                    </div>
                  ))}
                </div>
                <div className="text-right flex-shrink-0 w-[42px]">
                  <div className="text-[20px] font-bold text-[var(--text)] tracking-[-0.03em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cp.score}</div>
                  <div className="text-[9.5px] font-semibold text-[var(--text3)] tracking-[0.06em] uppercase mt-0.5">Power</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Genre heatmap */}
      <div className="max-w-[1280px] mx-auto px-7 pb-20">
        <div className="mp-card">
          <div className="flex items-center justify-between px-6 py-[17px] border-b border-[var(--border)]">
            <div className="text-[14px] font-extrabold tracking-[-0.02em] flex items-center gap-2.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,45,107,0.1)' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="#ff2d6b" strokeWidth="1.2" fill="none"/></svg>
              </div>
              Genre Trend Heatmap — Last 7 Days
            </div>
          </div>
          <div className="px-6 py-5">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-5 flex-wrap">
              {['No activity', 'Low', 'Moderate', 'High', 'Very High', 'Viral'].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text3)]">
                  <div className={cn('w-2.5 h-2.5 rounded-[3px]', HEAT_BG[i])} />
                  {label}
                </div>
              ))}
            </div>
            {/* Grid */}
            <div className="grid gap-[5px]" style={{ gridTemplateColumns: '90px repeat(7, 1fr)' }}>
              <div />
              {days.map(d => (
                <div key={d} className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] text-center">{d}</div>
              ))}
              {heatmap.map(row => (
                <>
                  <div key={`${row.genre}-label`} className="text-[11px] font-semibold text-[var(--text3)] flex items-center">{row.genre}</div>
                  {row.days.map((score, di) => {
                    const lvl = heatLevel(score)
                    return (
                      <div key={di}
                        className={cn('h-9 rounded-md flex items-center justify-center text-[11px] font-bold text-[rgba(255,255,255,0.45)] cursor-pointer transition-all border border-transparent hover:scale-110 hover:border-[rgba(255,255,255,0.15)] hover:text-[rgba(255,255,255,0.9)]', HEAT_BG[lvl])}>
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

// Tiny helpers
function MiniSparkline({ data }: { data: number[] }) {
  const w = 56, h = 20
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - v * (h - 2) - 1}`)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={`M${pts.join(' L')}`} stroke="#ff6b1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function PlatformIcon({ platform }: { platform: 'tiktok' | 'twitter' | 'youtube' }) {
  if (platform === 'tiktok') return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.5 2c.2 2.2 1.5 3.7 3.9 4.3v2.9c-1.4 0-2.7-.4-3.9-1.2V13c0 3-2.3 4.7-4.7 4.7S4.1 16 4.1 13s2.3-4.7 4.7-4.7c.35 0 .7.04 1 .1v3c-.3-.07-.65-.1-1-.1-1.05 0-1.8.8-1.8 1.7s.75 1.7 1.8 1.7 1.8-.8 1.8-1.7V2h2.9z" fill="#ff2d6b"/></svg>
  if (platform === 'twitter') return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 2l7 8.5L2 18h2.5l5-6 4.2 6H17.5L10.2 9.3 17 2H14.5L9 7.7 5.5 2H2z" fill="#3b82f6"/></svg>
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="3.5" width="17" height="13" rx="3.5" stroke="#ff3333" strokeWidth="1.4" fill="none"/><polygon points="8,7.5 14,10 8,12.5" fill="#ff3333"/></svg>
}

function MiniPlatformIcon({ platform }: { platform: string }) {
  const color = platform === 'tiktok' ? '#ff2d6b' : platform === 'twitter' ? '#3b82f6' : platform === 'youtube' ? '#ff3333' : '#1DB954'
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" fill={color} opacity="0.8"/></svg>
}
