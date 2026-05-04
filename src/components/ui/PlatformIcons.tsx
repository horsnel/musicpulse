'use client'

import type { TrendingPlatform, Platform } from '@/types'
import {
  SiSpotify,
  SiApplemusic,
  SiSoundcloud,
  SiTiktok,
  SiX,
  SiYoutube,
  SiBillboard,
  SiShazam,
  SiInstagram,
  SiRss,
} from 'react-icons/si'

type IconPlatform = TrendingPlatform | Platform | 'billboard' | 'shazam' | 'soundcloud' | 'deezer' | 'instagram' | 'rss'

interface PlatformIconProps {
  platform: IconPlatform
  size?: number
  className?: string
}

// Platform brand colors for consistent theming (light variants for dark background visibility)
const PLATFORM_ICON_COLORS: Record<string, string> = {
  spotify: '#1DB954',
  apple: '#FA243C',
  youtube: '#FF0000',
  tiktok: '#ffffff',
  twitter: '#ffffff',
  billboard: '#E60026',
  shazam: '#0E72ED',
  soundcloud: '#FF5500',
  deezer: '#A238FF',
  instagram: '#E4405F',
  rss: 'currentColor',
}

// Real brand icons from react-icons/si
export function PlatformIcon({ platform, size = 20, className }: PlatformIconProps) {
  const color = PLATFORM_ICON_COLORS[platform] ?? '#666'

  switch (platform) {
    case 'spotify':
      return <SiSpotify size={size} color={color} className={className} />
    case 'apple':
      return <SiApplemusic size={size} color={color} className={className} />
    case 'youtube':
      return <SiYoutube size={size} color={color} className={className} />
    case 'tiktok':
      return <SiTiktok size={size} color={color} className={className} />
    case 'twitter':
      return <SiX size={size} color={color} className={className} />
    case 'billboard':
      return <SiBillboard size={size} color={color} className={className} />
    case 'shazam':
      return <SiShazam size={size} color={color} className={className} />
    case 'soundcloud':
      return <SiSoundcloud size={size} color={color} className={className} />
    case 'deezer':
      // Deezer is not in react-icons/si — use custom SVG
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="1" y="2" width="22" height="2.5" rx="1" fill={color} />
          <rect x="1" y="6" width="16" height="2.5" rx="1" fill={color} />
          <rect x="1" y="10" width="11" height="2.5" rx="1" fill={color} />
          <rect x="1" y="14" width="7" height="2.5" rx="1" fill={color} />
          <rect x="1" y="18" width="4" height="2.5" rx="1" fill={color} />
        </svg>
      )
    case 'instagram':
      return <SiInstagram size={size} color={color} className={className} />
    case 'rss':
      return <SiRss size={size} color={color} className={className} />
    default: {
      const _exhaustive: never = platform
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" fill="#666" />
        </svg>
      )
    }
  }
}

// Mini version for tight spaces (badges, tabs, inline)
export function MiniPlatformIcon({ platform, size = 12, className }: PlatformIconProps) {
  return <PlatformIcon platform={platform} size={size} className={className} />
}

// Platform color and metadata helpers
export const PLATFORM_COLORS: Record<string, { color: string; rgb: string; dim: string }> = {
  spotify:    { color: '#1DB954', rgb: '29,185,84',   dim: 'rgba(29,185,84,0.1)' },
  apple:      { color: '#FA243C', rgb: '250,36,60',   dim: 'rgba(250,36,60,0.1)' },
  youtube:    { color: '#FF0000', rgb: '255,0,0',     dim: 'rgba(255,0,0,0.1)' },
  tiktok:     { color: '#ffffff', rgb: '255,255,255', dim: 'rgba(255,255,255,0.1)' },
  twitter:    { color: '#ffffff', rgb: '255,255,255', dim: 'rgba(255,255,255,0.1)' },
  billboard:  { color: '#E60026', rgb: '230,0,38',    dim: 'rgba(230,0,38,0.1)' },
  shazam:     { color: '#0E72ED', rgb: '14,114,237',  dim: 'rgba(14,114,237,0.1)' },
  soundcloud: { color: '#FF5500', rgb: '255,85,0',    dim: 'rgba(255,85,0,0.1)' },
  deezer:     { color: '#A238FF', rgb: '162,56,255',  dim: 'rgba(162,56,255,0.1)' },
  instagram:  { color: '#E4405F', rgb: '228,64,95',   dim: 'rgba(228,64,95,0.1)' },
}

export const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'X',
  billboard: 'Billboard',
  shazam: 'Shazam',
  soundcloud: 'SoundCloud',
  deezer: 'Deezer',
  instagram: 'Instagram',
  rss: 'RSS',
}
