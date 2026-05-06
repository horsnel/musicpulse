import type { Metadata } from 'next'
import Link from 'next/link'
import { getNewReleases } from '@/lib/data'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import type { Album } from '@/types'

export const metadata: Metadata = {
  title: 'Albums & New Releases',
  description: 'Latest albums, EPs, and singles from across the globe — updated daily.',
}

const TYPE_STYLES: Record<string, { variant: 'blue' | 'purple' | 'green' | 'pink'; label: string }> = {
  album:       { variant: 'blue',   label: 'Album' },
  ep:          { variant: 'purple', label: 'EP' },
  single:      { variant: 'green',  label: 'Single' },
  compilation: { variant: 'pink',   label: 'Compilation' },
}

function AlbumCard({ album }: { album: Album }) {
  const typeStyle = TYPE_STYLES[album.type] ?? TYPE_STYLES.album
  const hasCover = !!album.coverUrl

  return (
    <Link
      href={`/songs/${album.slug}`}
      className="block no-underline"
    >
      <div className="mp-card group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
        {/* Cover */}
        <div className="aspect-square relative overflow-hidden">
          {hasCover ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[48px]"
              style={{ background: 'linear-gradient(135deg, #642b73, #c6426e)' }}
            >
              🎵
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={typeStyle.variant}>{typeStyle.label}</Badge>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          <h3 className="text-[13px] sm:text-[14px] font-bold tracking-[-0.02em] mb-1 group-hover:text-[var(--blue)] transition-colors line-clamp-1">
            {album.title}
          </h3>
          <p className="text-[12px] text-[var(--text3)] font-medium truncate mb-1.5">
            {album.artistName}
          </p>
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--text3)] font-medium mt-auto">
            <span>{formatDate(album.releaseDate)}</span>
            <span className="text-[var(--border2)]">·</span>
            <span>{album.trackCount} tracks</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function AlbumsPage() {
  const albums = await getNewReleases(20)

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
            Albums & New Releases
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[var(--text2)] max-w-[550px] leading-relaxed font-medium">
            Latest albums, EPs, and singles
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-10 sm:pb-20">
        <div className="h-px bg-[var(--border)] mb-8 sm:mb-10" />

        {albums.length === 0 ? (
          <div className="text-center py-16 text-[var(--text3)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
            </svg>
            <p className="text-[14px] font-medium">Loading new releases...</p>
            <p className="text-[12px] mt-1">Album data refreshes daily from live sources.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {albums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
