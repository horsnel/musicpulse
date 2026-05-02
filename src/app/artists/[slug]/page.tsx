import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArtist } from '@/lib/data'
import { formatCount } from '@/lib/utils'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return [
    { slug: 'burna-boy' },
    { slug: 'kendrick-lamar' },
    { slug: 'billie-eilish' },
    { slug: 'rose' },
    { slug: 'sabrina-carpenter' },
    { slug: 'davido' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await getArtist(params.slug)
  if (!artist) return { title: 'Artist Not Found' }
  return {
    title: artist.name,
    description: `${artist.name} — ${artist.genres.join(', ')}. ${formatCount(artist.monthlyListeners)} monthly listeners on Spotify. Charts, top songs, discography, and more.`,
  }
}



export default async function ArtistPage({ params }: Props) {
  const artist = await getArtist(params.slug)
  if (!artist) notFound()

  // Accent color derived from artist origin (could be data-driven later)
  const accentColor = '#ff8c1a'
  const accentDim   = 'rgba(255,140,26,0.1)'

  return (
    <div className="relative z-10">

      {/* Hero banner */}
      <div className="relative overflow-hidden min-h-[520px]">
        {/* Gradient background */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(160deg,rgba(200,90,0,0.22) 0%,rgba(255,140,26,0.12) 30%,rgba(8,9,13,0.2) 70%,var(--bg) 100%)` }} />
        {/* Grid texture */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,140,26,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,26,0.04) 1px,transparent 1px)`,
            backgroundSize: '48px 48px',
            WebkitMaskImage: 'linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%)',
          }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-7 pt-[60px] pb-[48px] grid gap-[52px] items-end"
          style={{ gridTemplateColumns: '320px 1fr' }}>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {/* Spinning ring */}
            <div className="absolute inset-[-6px] rounded-full ring-rotate"
              style={{ background: `conic-gradient(from 0deg, ${accentColor}, ${accentColor}80, #1DB954, ${accentColor})` }} />
            <div className="relative z-10 w-[320px] h-[320px] rounded-full flex items-center justify-center text-[120px] border-4 border-[var(--bg)]"
              style={{ background: 'linear-gradient(135deg,#1a1a08,#2a1a00,#3a2000)', boxShadow: `0 32px 80px rgba(0,0,0,0.7),0 0 60px ${accentDim}` }}>
              🎤
            </div>
            {/* Verified badge */}
            {artist.verified && (
              <div className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full border-4 border-[var(--bg)] flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}80)`, boxShadow: `0 4px 16px rgba(255,140,26,0.4)` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M5 11.5L9 15.5L17 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="pb-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase rounded-full px-3 py-1 mb-4"
              style={{ color: accentColor, background: accentDim, border: `1px solid rgba(255,140,26,0.25)` }}>
              🌍 {artist.origin} · {artist.genres[0]}
            </div>

            <h1 className="leading-[0.92] mb-2.5"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(56px,7vw,88px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              {artist.name.split(' ').map((word, i) => (
                <span key={i} style={{ display: 'block', color: i > 0 ? accentColor : 'var(--text)', fontStyle: i > 0 ? 'italic' : 'normal' }}>
                  {word}
                </span>
              ))}
            </h1>

            {artist.aka && (
              <p className="text-[14px] font-medium text-[var(--text3)] tracking-[0.02em] mb-5">
                Born {artist.name} · <span className="text-[var(--text2)]">{artist.aka}</span>
              </p>
            )}

            {/* Listener count */}
            <div className="flex items-baseline gap-2.5 mb-5">
              <span className="font-black leading-none" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px,4vw,52px)', letterSpacing: '-0.03em' }}>
                {formatCount(artist.monthlyListeners)}
              </span>
              <span className="text-[16px] font-bold text-[var(--text3)] tracking-[-0.01em]">monthly listeners on Spotify</span>
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 mb-7">
              {artist.genres.map((g, i) => (
                <span key={g} className="text-[12px] font-semibold px-3 py-[5px] rounded-full border cursor-pointer transition-all hover:text-[var(--text2)]"
                  style={i < 2
                    ? { borderColor: accentColor, color: accentColor, background: accentDim }
                    : { borderColor: 'var(--border2)', color: 'var(--text3)' }}>
                  {g}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button className="flex items-center gap-2 text-[14px] font-black px-6 py-3 rounded-full border-none cursor-pointer transition-all hover:brightness-110"
                style={{ background: accentColor, color: '#000' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="7.5" y1="4" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Follow Artist
              </button>
              <button className="flex items-center gap-2 text-[14px] font-semibold px-5 py-[11px] rounded-full border border-[var(--border2)] text-[var(--text2)] cursor-pointer transition-all hover:border-[var(--text3)] hover:text-[var(--text)] bg-transparent">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polygon points="2,1.5 13,7.5 2,13.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>
                Play Top Songs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-[var(--border)]" style={{ background: 'linear-gradient(180deg,rgba(255,140,26,0.04) 0%,transparent 100%)' }}>
        <div className="max-w-[1280px] mx-auto grid border-t border-[var(--border)]"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            { label: 'Monthly Listeners', value: formatCount(artist.monthlyListeners), sub: '+1.2M this month', trend: { value: '+1.2M this month', up: true } },
            { label: 'Total Streams', value: artist.totalStreams ? formatCount(artist.totalStreams) : '—', sub: 'All-time Spotify' },
            { label: 'Followers', value: artist.followers ? formatCount(artist.followers) : '—', sub: 'Across platforms' },
            { label: 'YouTube Views', value: artist.youtubeViews ? formatCount(artist.youtubeViews) : '—', sub: 'Total video views' },
            { label: 'Active Since', value: String(artist.activeSince ?? '—'), sub: `${new Date().getFullYear() - (artist.activeSince ?? 0)} years in music` },
          ].map((s, i) => (
            <div key={i} className="bg-[var(--bg)] px-6 py-5 border-r border-[var(--border)] last:border-r-0 hover:bg-[var(--bg2)] transition-colors cursor-default">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5">{s.label}</div>
              <div className="text-[22px] font-extrabold tracking-[-0.03em]" style={{ color: i === 0 ? accentColor : 'var(--text)' }}>{s.value}</div>
              {s.trend ? (
                <div className="text-[11px] font-bold text-[var(--green)] mt-1 flex items-center gap-1">
                  ↑ {s.trend.value}
                </div>
              ) : (
                <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5">{s.sub}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-7 py-8 grid gap-7 items-start" style={{ gridTemplateColumns: '1fr 360px' }}>

        {/* Left */}
        <div className="flex flex-col gap-8">

          {/* About */}
          <div>
            <div className="text-[13px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] flex items-center gap-2 mb-5">
              <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ background: accentDim }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke={accentColor} strokeWidth="1.2" fill="none"/><path d="M1.5 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>
              </div>
              About
            </div>
            <div className="mp-card p-7 relative overflow-hidden">
              <div className="absolute top-[-10px] right-5 text-[160px] leading-none pointer-events-none select-none"
                style={{ fontFamily: 'Playfair Display, serif', color: `rgba(255,140,26,0.05)` }}>"</div>
              <p className="text-[15px] text-[var(--text2)] leading-[1.8] tracking-[-0.003em]" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                <span className="text-[var(--text)] font-bold not-italic">Damini Ebunoluwa Ogulu</span>, known professionally as{' '}
                <span className="text-[var(--text)] font-bold not-italic">Burna Boy</span>, is a Nigerian singer, songwriter, and record producer from{' '}
                <span className="text-[var(--text)] font-bold not-italic">Port Harcourt, Nigeria</span>. He is widely regarded as one of the most influential African artists of his generation, credited with bringing Afrofusion — his blend of Afrobeats, dancehall, reggae, and R&B — to a global stage.
                His album <span className="text-[var(--text)] font-bold not-italic">Twice as Tall</span> won the{' '}
                <span className="text-[var(--text)] font-bold not-italic">Grammy Award for Best Global Music Album</span> in 2021.
              </p>
              <button className="mt-4 text-[13px] font-semibold flex items-center gap-1.5 transition-all hover:gap-2.5" style={{ color: accentColor }}>
                Read full biography
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="2" y1="6.5" x2="11" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="7.5,2.5 11,6.5 7.5,10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </button>
            </div>
          </div>

          {/* Top Songs */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[13px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] flex items-center gap-2">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ background: 'var(--green-dim)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="2,1.5 11,6.5 2,11.5" stroke="#1DB954" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>
                </div>
                Popular Songs
              </div>
              <a href={`/artists/${params.slug}/songs`} className="text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors">
                See all <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </a>
            </div>
            {[
              { num: 1, title: 'Last Last', album: 'Love, Damini', streams: 412000000, pop: 100, grad: 'linear-gradient(135deg,#1a1000,#3a2800)', emoji: '🎶', playing: true },
              { num: 2, title: 'Ye', album: 'Outside', streams: 398000000, pop: 88, grad: 'linear-gradient(135deg,#0a1a08,#1a3010)', emoji: '🌿', playing: false },
              { num: 3, title: 'Anybody', album: 'African Giant', streams: 361000000, pop: 82, grad: 'linear-gradient(135deg,#1a0808,#381818)', emoji: '🔥', playing: false },
              { num: 4, title: 'On The Low', album: 'African Giant', streams: 340000000, pop: 76, grad: 'linear-gradient(135deg,#080818,#181838)', emoji: '⭐', playing: false },
              { num: 5, title: 'Kilometre', album: 'Twice as Tall', streams: 318000000, pop: 71, grad: 'linear-gradient(135deg,#1a0a18,#381028)', emoji: '🌙', playing: false },
              { num: 6, title: 'Commas', album: 'I Told Them…', streams: 295000000, pop: 68, grad: 'linear-gradient(135deg,#1a1000,#2a1800)', emoji: '🎵', playing: false },
              { num: 7, title: 'Location', album: 'Outside', streams: 280000000, pop: 64, grad: 'linear-gradient(135deg,#001a10,#003020)', emoji: '🌊', playing: false },
              { num: 8, title: 'Way Too Big', album: 'I Told Them…', streams: 264000000, pop: 60, grad: 'linear-gradient(135deg,#180a00,#301500)', emoji: '🏆', playing: false },
            ].map(s => (
              <div key={s.num}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-[var(--bg3)]"
                style={s.playing ? { background: 'rgba(255,140,26,0.06)' } : {}}>
                <span className="text-[14px] font-bold w-[22px] text-center flex-shrink-0"
                  style={{ color: s.playing ? accentColor : 'var(--text3)' }}>
                  {s.playing ? (
                    <div className="playing-bars" style={{ '--bar-color': accentColor } as React.CSSProperties} />
                  ) : s.num}
                </span>
                <div className="w-11 h-11 rounded-[9px] flex items-center justify-center text-[22px] flex-shrink-0 border border-[var(--border)]"
                  style={{ background: s.grad }}>{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold tracking-[-0.02em] truncate" style={{ color: s.playing ? accentColor : '' }}>{s.title}</div>
                  <div className="text-[12px] text-[var(--text3)] font-medium mt-0.5">{s.album}</div>
                </div>
                <div className="w-20 flex-shrink-0">
                  <div className="h-[3px] bg-[var(--border2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pop}%`, background: s.playing ? accentColor : 'var(--text3)' }} />
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-[var(--text3)] w-[52px] text-right tabular-nums">{formatCount(s.streams)}</span>
                <span className="text-[12.5px] font-medium text-[var(--text3)] w-9 text-right tabular-nums">
                  {Math.floor(s.streams / 60000 % 60).toString().padStart(1, '0')}:{Math.floor(Math.random() * 40 + 10)}
                </span>
              </div>
            ))}
          </div>

          {/* Discography */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[13px] font-bold tracking-[0.08em] uppercase text-[var(--text3)] flex items-center gap-2">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ background: 'var(--blue-dim)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#4361ff" strokeWidth="1.1" fill="none"/><circle cx="6.5" cy="6.5" r="2" fill="#4361ff"/></svg>
                </div>
                Discography
              </div>
              <a href={`/artists/${params.slug}/discography`} className="text-[12px] font-semibold text-[var(--text3)] no-underline flex items-center gap-1 hover:text-[var(--text2)] transition-colors">
                All releases <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
              </a>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: 'I Told Them…', year: 2023, emoji: '🎙️', grad: 'linear-gradient(135deg,#1a1000,#3a2800)', badge: 'Latest', badgeStyle: { background: accentColor, color: '#000' } },
                { title: 'Love, Damini', year: 2022, emoji: '💚', grad: 'linear-gradient(135deg,#001a10,#003020)', badge: 'Album', badgeStyle: { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)' } },
                { title: 'Twice as Tall', year: 2020, emoji: '🏆', grad: 'linear-gradient(135deg,#10001a,#200038)', badge: 'Grammy', badgeStyle: { background: 'rgba(255,184,48,0.15)', color: 'var(--gold)' } },
                { title: 'African Giant', year: 2019, emoji: '🌍', grad: 'linear-gradient(135deg,#1a0a00,#381800)', badge: 'Album', badgeStyle: { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)' } },
              ].map(a => (
                <div key={a.title} className="cursor-pointer group transition-transform hover:-translate-y-[3px]">
                  <div className="aspect-square rounded-[12px] flex items-center justify-center text-[40px] border border-[var(--border)] mb-3 relative overflow-hidden transition-shadow hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                    style={{ background: a.grad }}>
                    {a.emoji}
                    <span className="absolute top-[7px] left-[7px] text-[9px] font-bold px-[7px] py-[3px] rounded-[5px]" style={a.badgeStyle}>{a.badge}</span>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px] flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/><polygon points="11,9 20,14 11,19" fill="white"/></svg>
                    </div>
                  </div>
                  <div className="text-[13px] font-bold tracking-[-0.02em] truncate">{a.title}</div>
                  <div className="text-[11.5px] text-[var(--text3)] font-medium mt-0.5">{a.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">

          {/* Artist facts */}
          <div className="mp-card">
            <div className="px-[18px] py-[15px] border-b border-[var(--border)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)] flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: accentDim }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polygon points="6,0.8 7.4,4.2 11,4.5 8.4,7 9.2,10.7 6,8.8 2.8,10.7 3.6,7 1,4.5 4.6,4.2" stroke={accentColor} strokeWidth="1" fill="none" strokeLinejoin="round"/></svg>
              </div>
              Artist Facts
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
              {[
                { k: 'Real Name', v: 'Damini Ogulu' },
                { k: 'Born', v: 'Jul 2, 1991', sub: 'Age 33' },
                { k: 'Origin', v: artist.origin ?? '—', accent: true },
                { k: 'Label', v: artist.label ?? '—' },
                { k: 'Debut', v: artist.debutAlbum ?? '—', sub: '2013' },
                { k: 'Albums', v: String(artist.albumCount ?? '—'), accent: true },
              ].map(f => (
                <div key={f.k} className="bg-[var(--bg2)] px-4 py-3.5">
                  <div className="text-[9.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)] mb-1.5">{f.k}</div>
                  <div className="text-[14px] font-bold tracking-[-0.02em]" style={{ color: f.accent ? accentColor : 'var(--text)' }}>{f.v}</div>
                  {f.sub && <div className="text-[10.5px] text-[var(--text3)] mt-0.5">{f.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="mp-card">
            <div className="px-[18px] py-[15px] border-b border-[var(--border)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Awards &amp; Recognition</div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {[
                { icon: '🏆', title: 'Grammy Award', meta: 'Best Global Music Album · 2021', bg: 'rgba(255,184,48,0.1)' },
                { icon: '🎖️', title: 'BET Award', meta: 'Best International Act · 2019, 2022', bg: `${accentDim}` },
                { icon: '🎵', title: 'MOBO Award', meta: 'Best African Music Act · 2021', bg: 'var(--green-dim)' },
                { icon: '🌍', title: 'MTV EMA', meta: 'Best African Act · 2020, 2021', bg: 'var(--blue-dim)' },
              ].map(a => (
                <div key={a.title} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[16px] flex-shrink-0" style={{ background: a.bg }}>{a.icon}</div>
                  <div>
                    <div className="text-[13px] font-bold tracking-[-0.01em]">{a.title}</div>
                    <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5">{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Similar artists */}
          <div className="mp-card">
            <div className="px-[18px] py-[15px] border-b border-[var(--border)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--text3)]">Similar Artists</div>
            <div className="p-3.5 grid grid-cols-2 gap-2">
              {[
                { name: 'Wizkid', genre: 'Afrobeats', listeners: '32.1M', emoji: '🎤', grad: 'linear-gradient(135deg,#1a0a18,#381028)' },
                { name: 'Davido', genre: 'Afropop', listeners: '22.4M', emoji: '🎸', grad: 'linear-gradient(135deg,#001018,#002038)' },
                { name: 'Kizz Daniel', genre: 'Afrobeats', listeners: '14.8M', emoji: '🌍', grad: 'linear-gradient(135deg,#181000,#302000)' },
                { name: 'Omah Lay', genre: 'Afropop', listeners: '11.2M', emoji: '🎵', grad: 'linear-gradient(135deg,#001808,#003018)' },
              ].map(a => (
                <a key={a.name} href={`/artists/${a.name.toLowerCase().replace(' ', '-')}`}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--bg3)] no-underline">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-[26px] border-2 border-[var(--border2)] transition-all hover:border-[#ff8c1a] hover:shadow-[0_0_0_3px_rgba(255,140,26,0.1)]"
                    style={{ background: a.grad }}>{a.emoji}</div>
                  <div className="text-[12.5px] font-bold tracking-[-0.02em] text-center text-[var(--text)]">{a.name}</div>
                  <div className="text-[11px] text-[var(--text3)] font-medium">{a.genre}</div>
                  <div className="text-[10.5px] text-[var(--text3)]">{a.listeners}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
