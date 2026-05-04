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
  SiBandcamp,
  SiAudiomack,
  SiGenius,
  SiIheartradio,
} from 'react-icons/si'

type IconPlatform = TrendingPlatform | Platform | 'billboard' | 'shazam' | 'soundcloud' | 'deezer' | 'instagram' | 'rss' | 'bandcamp' | 'audiomack' | 'genius' | 'musixmatch' | 'iheart'

interface PlatformIconProps {
  platform: IconPlatform
  size?: number
  className?: string
}

// Platform brand colors for consistent theming
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
  bandcamp: '#629AA9',
  audiomack: '#FFA200',
  genius: '#FFFF64',
  musixmatch: '#FF6E40',
  iheart: '#C6002B',
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
      // Deezer is not in react-icons/si — use custom SVG (rainbow bars logo)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="2" y="2" width="20" height="2.2" rx="1" fill="#E4363A" />
          <rect x="2" y="5.6" width="15" height="2.2" rx="1" fill="#F0883B" />
          <rect x="2" y="9.2" width="10.5" height="2.2" rx="1" fill="#D1C73E" />
          <rect x="2" y="12.8" width="7.5" height="2.2" rx="1" fill="#62B64F" />
          <rect x="2" y="16.4" width="5" height="2.2" rx="1" fill="#4297D1" />
          <rect x="2" y="20" width="2.5" height="2.2" rx="1" fill="#8C5DD2" />
        </svg>
      )
    case 'bandcamp':
      return <SiBandcamp size={size} color={color} className={className} />
    case 'audiomack':
      return <SiAudiomack size={size} color={color} className={className} />
    case 'genius':
      return <SiGenius size={size} color={color} className={className} />
    case 'musixmatch':
      // Musixmatch is not in react-icons/si — use custom SVG
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
          <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>M</text>
        </svg>
      )
    case 'iheart':
      return <SiIheartradio size={size} color={color} className={className} />
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
  bandcamp:   { color: '#629AA9', rgb: '98,154,169',  dim: 'rgba(98,154,169,0.1)' },
  audiomack:  { color: '#FFA200', rgb: '255,162,0',   dim: 'rgba(255,162,0,0.1)' },
  genius:     { color: '#FFFF64', rgb: '255,255,100', dim: 'rgba(255,255,100,0.1)' },
  musixmatch: { color: '#FF6E40', rgb: '255,110,64',  dim: 'rgba(255,110,64,0.1)' },
  iheart:     { color: '#C6002B', rgb: '198,0,43',    dim: 'rgba(198,0,43,0.1)' },
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
  bandcamp: 'Bandcamp',
  audiomack: 'Audiomack',
  genius: 'Genius',
  musixmatch: 'Musixmatch',
  iheart: 'iHeartRadio',
}
