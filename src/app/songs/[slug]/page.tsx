import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSong } from '@/lib/data'
import { formatCount, formatDuration, formatDate } from '@/lib/utils'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return [
    { slug: 'apt-rose-bruno-mars' },
    { slug: 'die-with-a-smile' },
    { slug: 'birds-of-a-feather' },
    { slug: 'espresso' },
    { slug: 'not-like-us' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const song = await getSong(params.slug)
  if (!song) return { title: 'Song Not Found' }
  return {
    title: `${song.title} — ${song.artistName}`,
    description: `${song.title} by ${song.artistName}. Charts, streaming stats, TikTok usage, and more on MusicPulse.`,
  }
}




export default async function SongPage({ params }: Props) {
  const song = await getSong(params.slug)
  if (!song) notFound()

  const accentColor = '#c6426e'
  const accentDim   = 'rgba(198,66,110,0.1)'

  const statStrip = [
    { label: 'Spotify Streams', value: '2.1B', sub: '+4.2M this week', trend: true, icon: '📊' },
    { label: 'Peak Position', value: '#1', sub: 'Spotify Global · 6 weeks', icon: '⭐' },
    { label: 'TikTok Uses', value: song.tiktokUses ? formatCount(song.tiktokUses) : '—', sub: 'Sounds using this track', icon: '🎵' },
    { label: 'YouTube Views', value: '180M', sub: 'Music video', icon: '📺' },
    { label: 'On Charts', value: '18 wks', sub: 'Still climbing in 34 countries', icon: '🗓️' },
  ]

  return (
    <div className="relative z-10">

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ minHeight: '520px' }}>
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(160deg,rgba(100,43,115,0.4) 0%,rgba(198,66,110,0.25) 40%,transparent 100%)` }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(67,97,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(67,97,255,0.04) 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-[48px] pb-[48px] grid gap-10 items-end"
          style={{ gridTemplateColumns: '280px 1fr' }}>

          {/* Album art */}
          <div className="relative group">
            <div className="w-[280px] h-[280px] rounded-[20px] flex items-center justify-center text-[96px] relative overflow-hidden cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#642b73,#c6426e)', boxShadow: '0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06)' }}>
              🌸
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(29,185,84,0.9)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="7,4 20,12 7,20" fill="#000"/></svg>
                </div>
              </div>
            </div>
            {/* Vinyl */}
            <div className="absolute top-1/2 right-[-60px] w-[200px] h-[200px] -translate-y-1/2 rounded-full z-[-1] flex items-center justify-center vinyl-spin"
              style={{ background: 'repeating-radial-gradient(circle at center,#1a1a1a 0px,#111 2px,#222 3px,#111 4px)', boxShadow: '4px 0 24px rgba(0,0,0,0.5)', transition: 'right 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle,#c6426e,#642b73)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111]" />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase rounded-full px-3 py-1 mb-4"
              style={{ color: accentColor, background: accentDim, border: `1px solid rgba(198,66,110,0.25)` }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/><polygon points="4,3 8.5,5.5 4,8" fill="currentColor"/></svg>
              Single · 2024
            </div>

            <h1 className="text-[clamp(36px,5vw,62px)] font-black tracking-[-0.04em] leading-[1] mb-2.5"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              APT.
            </h1>

            {/* Artist chips */}
            <div className="flex items-center gap-3 mb-5">
              {[
                { name: 'Rose', grad: 'linear-gradient(135deg,#642b73,#c6426e)', emoji: '🌸' },
                { name: 'Bruno Mars', grad: 'linear-gradient(135deg,#1a4a6e,#2196f3)', emoji: '🎤' },
              ].map((a, i) => (
                <>
                  {i > 0 && <span className="text-[13px] text-[var(--text3)] font-medium">feat.</span>}
                  <a key={a.name} href={`/artists/${a.name.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center gap-2 px-3.5 py-[5px] pr-3.5 rounded-full no-underline transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] flex-shrink-0" style={{ background: a.grad }}>{a.emoji}</div>
                    <span className="text-[13px] font-semibold text-[var(--text)]">{a.name}</span>
                  </a>
                </>
              ))}
            </div>

            {/* Info row */}
            <div className="flex items-center gap-5 text-[13px] text-[var(--text3)] font-medium mb-7 flex-wrap">
              {[`Released ${formatDate(song.releaseDate)}`, formatDuration(song.durationMs), song.genres.join(' · '), song.label ?? ''].filter(Boolean).map((item, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} className="w-[3px] h-[3px] rounded-full bg-[var(--border2)]" />}
                  <span key={item}>{item}</span>
                </>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button className="flex items-center gap-2.5 px-[26px] py-3 rounded-full text-[14px] font-black border-none cursor-pointer transition-all hover:bg-[#1ed760] hover:shadow-[0_8px_30px_rgba(29,185,84,0.35)]"
                style={{ background: 'var(--green)', color: '#000' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="3,1 15,8 3,15" fill="currentColor"/></svg>
                Play Preview
              </button>
              {[
                { label: 'Open in Spotify', color: '#1DB954' },
                { label: 'Apple Music', color: '#fc3c44' },
              ].map(p => (
                <button key={p.label} className="flex items-center gap-2 px-[18px] py-3 rounded-full text-[13px] font-semibold border border-[var(--border2)] text-[var(--text2)] cursor-pointer transition-all hover:border-[var(--text3)] hover:text-[var(--text)] bg-transparent">
                  <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-[1200px] mx-auto px-6 my-7">
        <div className="grid border border-[var(--border)] rounded-[16px] overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {statStrip.map((s, i) => (
            <div key={s.label}
              className="bg-[var(--bg2)] px-6 py-5 border-r border-[var(--border)] last:border-r-0 hover:bg-[var(--bg3)] transition-colors cursor-default">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5 flex items-center gap-1.5">
                <span>{s.icon}</span>{s.label}
              </div>
              <div className="text-[22px] font-black tracking-[-0.03em]" style={{ color: i === 1 ? 'var(--gold)' : 'var(--text)' }}>{s.value}</div>
              {s.trend ? (
                <div className="text-[11px] font-bold text-[var(--green)] mt-1 flex items-center gap-1">↑ +4.2M this week</div>
              ) : (
                <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20 grid gap-7 items-start" style={{ gridTemplateColumns: '1fr 360px' }}>

        {/* Left */}
        <div className="flex flex-col gap-6">

          {/* Chart history */}
          <div className="mp-card">
            <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[var(--border)]">
              <div className="text-[14px] font-bold tracking-[-0.02em] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green-dim)' }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,13 4.5,8 8,10.5 11.5,5 14,2" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
                Chart Performance
              </div>
            </div>
            <div className="p-[22px]">
              {/* Sparkline */}
              <svg viewBox="0 0 400 80" className="w-full h-20 mb-5" preserveAspectRatio="none">
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

              {[
                { platform: 'Spotify Global', dot: '#1DB954', pos: '#3', peak: '#1', weeks: 18, streams: '2.1B' },
                { platform: 'Apple Music Global', dot: '#fc3c44', pos: '#1', peak: '#1', weeks: 18, streams: '—' },
                { platform: 'YouTube Music', dot: '#ff4444', pos: '#4', peak: '#2', weeks: 16, streams: '180M views' },
                { platform: 'Spotify Nigeria', dot: '#4361ff', pos: '#12', peak: '#8', weeks: 14, streams: '—' },
              ].map(r => (
                <div key={r.platform} className="grid items-center border-b border-[var(--border)] last:border-0"
                  style={{ gridTemplateColumns: '1fr 80px 80px 60px 80px' }}>
                  <div className="flex items-center gap-2 py-3 text-[12.5px] font-semibold">
                    <span className="w-2 h-2 rounded-full" style={{ background: r.dot }} />
                    {r.platform}
                  </div>
                  <div className="text-[13px] font-black" style={{ color: r.pos === '#1' ? 'var(--gold)' : 'var(--green)' }}>{r.pos}</div>
                  <div className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><polygon points="4.5,0.5 5.5,3.2 8.5,3.4 6.3,5.4 7,8.3 4.5,6.8 2,8.3 2.7,5.4 0.5,3.4 3.5,3.2" fill="currentColor"/></svg>
                    {r.peak}
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--text2)]">{r.weeks}w</div>
                  <div className="text-[12px] font-semibold text-[var(--text3)]">{r.streams}</div>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="mp-card p-[22px]">
            <div className="text-[14px] font-bold tracking-[-0.02em] mb-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-dim)' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="#b06cff" strokeWidth="1.3" fill="none"/><path d="M2 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#b06cff" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </div>
              About This Song
            </div>
            <p className="text-[14px] text-[var(--text2)] leading-[1.75] font-normal">
              <span className="text-[var(--text)] font-semibold">"APT."</span> is a collaboration between{' '}
              <span className="text-[var(--text)] font-semibold">Rose</span> of BLACKPINK and{' '}
              <span className="text-[var(--text)] font-semibold">Bruno Mars</span>, inspired by a popular Korean drinking game called{' '}
              <span className="text-[var(--text)] font-semibold">Apartment (아파트)</span>. The track blends Rose's pop sensibility with Bruno Mars' funk and R&B style, resulting in a globally infectious crossover that topped charts in over 30 countries.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['K-Pop', 'Collaboration', 'Pop', 'Korean drinking game', 'Bruno Mars', 'BLACKPINK', 'TikTok viral'].map(tag => (
                <span key={tag} className="text-[12px] font-semibold px-3.5 py-[5px] rounded-full border border-[var(--border2)] text-[var(--text3)] cursor-pointer hover:border-[var(--text3)] hover:text-[var(--text2)] transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">

          {/* Song details */}
          <div className="mp-card">
            <div className="px-[18px] py-[15px] border-b border-[var(--border)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Song Details</div>
            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
              {[
                { k: 'Release Date', v: formatDate(song.releaseDate) },
                { k: 'Duration', v: formatDuration(song.durationMs) },
                { k: 'Key / BPM', v: song.key ?? '—', sub: `${song.bpm ?? '—'} BPM` },
                { k: 'Label', v: song.label ?? '—' },
                { k: 'Genre', v: song.genres.join(' · '), accent: true },
                { k: 'Language', v: song.language ?? '—' },
              ].map(f => (
                <div key={f.k} className="bg-[var(--bg2)] px-4 py-3.5">
                  <div className="text-[9.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5">{f.k}</div>
                  <div className="text-[14px] font-bold tracking-[-0.02em]" style={{ color: f.accent ? accentColor : 'var(--text)', fontSize: f.v.length > 12 ? '12px' : '14px' }}>{f.v}</div>
                  {f.sub && <div className="text-[10.5px] text-[var(--text3)] mt-0.5">{f.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Stream links */}
          <div className="mp-card">
            <div className="px-[18px] py-[15px] border-b border-[var(--border)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Listen Now</div>
            <div className="p-4 flex flex-col gap-2">
              {[
                { name: 'Spotify', sub: '2.1B streams', color: '#1DB954', iconBg: 'rgba(29,185,84,0.1)' },
                { name: 'Apple Music', sub: 'Currently #1', color: '#fc3c44', iconBg: 'rgba(252,60,68,0.1)' },
                { name: 'YouTube Music', sub: '180M views', color: '#ff4444', iconBg: 'rgba(255,68,68,0.1)' },
                { name: 'TikTok', sub: '4.2M sounds', color: '#ff2d6b', iconBg: 'rgba(255,45,107,0.1)' },
              ].map(s => (
                <a key={s.name} href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] no-underline transition-all hover:border-[var(--border2)] hover:bg-[var(--bg3)]">
                  <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: s.iconBg }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold tracking-[-0.01em] text-[var(--text)]">{s.name}</div>
                    <div className="text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--text3)]">
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
