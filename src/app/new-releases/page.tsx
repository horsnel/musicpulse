import type { Metadata } from 'next'
import { getNewReleases } from '@/lib/data'
import { ReleasesGrid } from '@/components/song/ReleasesGrid'
import { SectionHeader } from '@/components/ui'

export const metadata: Metadata = {
  title: 'New Releases',
  description: 'Discover the latest album and single releases across all genres — updated daily from Spotify, Apple Music, and more.',
}

export default async function NewReleasesPage() {
  const releases = await getNewReleases(10)

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(67,97,255,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-8 sm:pb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
            style={{ background: 'var(--blue-dim)', border: '1px solid rgba(67,97,255,0.25)', color: 'var(--blue)' }}>
            Fresh Drops
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
            New Releases
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            The latest albums, EPs, and singles from across the globe. Updated daily so you can stay on top of every fresh drop.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-8 sm:mb-10" />
        <ReleasesGrid albums={releases} />
      </div>
    </div>
  )
}
