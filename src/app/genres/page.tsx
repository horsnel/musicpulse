import type { Metadata } from 'next'
import { GenrePills } from '@/components/ui/GenrePills'

export const metadata: Metadata = {
  title: 'Browse Genres',
  description: 'Explore music by genre — from Afrobeats and K-Pop to Hip-Hop and Electronic. Find your sound.',
}

const GENRE_CARDS = [
  { label: 'Pop', emoji: '🎤', gradient: 'linear-gradient(135deg,#642b73,#c6426e)', description: 'Mainstream hits and radio favorites. From chart-toppers to indie pop gems.' },
  { label: 'Hip-Hop', emoji: '🎧', gradient: 'linear-gradient(135deg,#4b1248,#f10711)', description: 'Bars, beats, and culture. Trap, conscious rap, and everything in between.' },
  { label: 'Afrobeats', emoji: '🌍', gradient: 'linear-gradient(135deg,#1a1000,#3a2800)', description: 'The sound of Africa going global. Burna Boy, Davido, Wizkid, and rising stars.' },
  { label: 'K-Pop', emoji: '🌸', gradient: 'linear-gradient(135deg,#6a1a6e,#b06cff)', description: 'Korean pop domination. Groups, soloists, and the fandoms driving the wave.' },
  { label: 'Latin', emoji: '💃', gradient: 'linear-gradient(135deg,#b85500,#ff8c00)', description: 'Reggaeton, Latin pop, and regional Mexican music taking over the world.' },
  { label: 'R&B', emoji: '🎵', gradient: 'linear-gradient(135deg,#1a4a6e,#2196f3)', description: 'Smooth vocals, deep grooves. Contemporary and classic rhythm and blues.' },
  { label: 'Amapiano', emoji: '🎹', gradient: 'linear-gradient(135deg,#0f2027,#2c5364)', description: 'South Africa\'s house subgenre with deep basslines and soulful melodies.' },
  { label: 'Dancehall', emoji: '🏝️', gradient: 'linear-gradient(135deg,#134e5e,#71b280)', description: 'Caribbean rhythms and bass-heavy beats. Roots reggae meets modern production.' },
  { label: 'Reggaeton', emoji: '🔥', gradient: 'linear-gradient(135deg,#c94b4b,#4b134f)', description: 'The dembow beat that conquered the globe. Bad Bunny, Daddy Yankee, and more.' },
  { label: 'Drill', emoji: '🥊', gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', description: 'Hard-hitting 808s and sliding beats. UK, Brooklyn, and beyond.' },
  { label: 'Indie', emoji: '🎸', gradient: 'linear-gradient(135deg,#2d1b69,#11998e)', description: 'Alternative sounds and DIY spirit. Lo-fi, dream pop, and post-punk revival.' },
  { label: 'Electronic', emoji: '⚡', gradient: 'linear-gradient(135deg,#0a0a2e,#1e3a8a)', description: 'From techno to EDM. Festival anthems, underground cuts, and everything synth.' },
]

export default function GenresPage() {
  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 60% 40%, rgba(255,184,48,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,184,48,0.25)', color: 'var(--gold)' }}>
            Find Your Sound
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            Browse by Genre
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Explore the full spectrum of music — from Afrobeats and Amapiano to Drill and Electronic. Every genre, every vibe.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-6 sm:mb-10" />

        {/* Quick filter pills */}
        <div className="mb-12">
          <GenrePills />
        </div>

        {/* Genre cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GENRE_CARDS.map((genre) => (
            <a
              key={genre.label}
              href={`/charts`}
              className="mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl no-underline"
            >
              {/* Gradient header */}
              <div
                className="h-[100px] flex items-center justify-center text-[44px] relative"
                style={{ background: genre.gradient }}
              >
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {genre.emoji}
                </span>
              </div>
              {/* Info */}
              <div className="p-5">
                <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[var(--text)] group-hover:text-[var(--green)] transition-colors">
                  {genre.label}
                </h3>
                <p className="text-[13px] text-[var(--text3)] mt-2 leading-relaxed font-medium">
                  {genre.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
