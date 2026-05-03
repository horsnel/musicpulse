'use client'

import type { TrendingPlatform, Platform } from '@/types'

type IconPlatform = TrendingPlatform | Platform | 'billboard' | 'shazam' | 'soundcloud' | 'deezer' | 'instagram' | 'rss'

interface PlatformIconProps {
  platform: IconPlatform
  size?: number
  className?: string
}

// Real brand SVG icons for each platform
export function PlatformIcon({ platform, size = 20, className }: PlatformIconProps) {
  switch (platform) {
    case 'spotify':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="12" fill="#1DB954" />
          <path d="M17.07 13.72c-2.37-1.46-6.48-1.62-8.82-.9-.38.12-.78-.1-.9-.47-.12-.38.1-.78.47-.9 2.7-.84 7.24-.68 10.02 1.02.34.2.45.64.25.98-.2.34-.64.45-.98.25l-.04.02z" fill="#fff" />
          <path d="M16.28 16.34c-1.95-1.2-5.35-1.6-7.82-.94-.32.1-.66-.08-.76-.4-.1-.32.08-.66.4-.76 2.84-.84 6.6-.4 8.88 1 .28.18.37.56.2.84-.18.28-.56.37-.84.2l-.06.06z" fill="#fff" />
          <path d="M15.56 18.84c-1.58-.97-4.32-1.28-6.4-.72-.26.07-.54-.08-.61-.34-.07-.26.08-.54.34-.61 2.34-.64 5.38-.3 7.22.82.24.14.31.44.17.66-.14.24-.44.31-.66.17l-.06.02z" fill="#fff" />
        </svg>
      )

    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.46.26 3.62 1.98-.09.06-2.16 1.27-2.14 3.79.02 3.01 2.62 4.01 2.65 4.03-.02.07-.42 1.44-1.38 2.83l.05.03z" fill="#fc3c44" />
          <path d="M15.57 5.36c.72-.88 1.22-2.1 1.08-3.32-1.05.04-2.32.7-3.07 1.58-.67.78-1.26 2.03-1.1 3.22 1.17.09 2.35-.59 3.09-1.48z" fill="#fc3c44" />
        </svg>
      )

    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81z" fill="#FF0000" />
          <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#fff" />
        </svg>
      )

    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.1a8.18 8.18 0 005.58 2.18V11.8a4.84 4.84 0 01-3.77-1.74V6.69h3.77z" fill="#fff" />
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.1a8.18 8.18 0 005.58 2.18V11.8a4.84 4.84 0 01-3.77-1.74V6.69h3.77z" fill="url(#tiktok-a)" />
          <path d="M15.82 2v.44a4.83 4.83 0 003.77 4.25V5.08a4.83 4.83 0 01-3.77-3.08z" fill="#25F4EE" />
          <path d="M15.82 10.06A8.18 8.18 0 0112 8.44v6.56a6.34 6.34 0 01-5.5 3.86 6.3 6.3 0 01-3.32-.95 6.34 6.34 0 0010.64.75v-6.56l.01-.04z" fill="#FE2C55" />
          <path d="M12 8.44a8.18 8.18 0 01-3.82-.95v6.56a2.89 2.89 0 01-2.88 2.5 2.86 2.86 0 01-1.98-.79A2.89 2.89 0 006.1 18.2a2.89 2.89 0 002.88-2.5l.02-.02V8.44h3z" fill="#25F4EE" />
          <defs>
            <linearGradient id="tiktok-a" x1="6.5" y1="9.5" x2="17" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#25F4EE" />
              <stop offset="1" stopColor="#FE2C55" />
            </linearGradient>
          </defs>
        </svg>
      )

    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000" />
        </svg>
      )

    case 'billboard':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect width="24" height="24" rx="4" fill="#E60026" />
          <path d="M5 7h2.5c1.4 0 2.5.8 2.5 2.2 0 .9-.5 1.5-1.2 1.8.9.3 1.5 1 1.5 2 0 1.5-1.2 2.5-2.8 2.5H5V7zm2.2 3.3c.8 0 1.3-.4 1.3-1s-.5-1-1.3-1H6.5v2h.7zm.2 3.7c.9 0 1.5-.5 1.5-1.2s-.6-1.2-1.5-1.2H6.5v2.4h.9zM13 7h1.5v6.5c0 1.4.8 2 2 2s2-.6 2-2V7H20v6.5c0 2.4-1.5 3.8-3.5 3.8S13 15.9 13 13.5V7z" fill="#fff" />
        </svg>
      )

    case 'shazam':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="12" fill="#0E72ED" />
          <path d="M15.6 7.5c-.3-.2-.8-.2-1.1.1L11.2 11c-.2.2-.2.5 0 .7.2.2.5.2.7 0l3.3-3.4c.1-.1.3-.1.4 0 .1.1.1.3 0 .4L12.3 12c-.2.2-.2.5 0 .7.1.1.2.1.3.1s.3-.1.4-.2l3.3-3.4c.6-.6.5-1.3-.1-1.7h-.6zm-4.2 3.3c-.2-.2-.5-.2-.7 0l-3.3 3.4c-.1.1-.3.1-.4 0-.1-.1-.1-.3 0-.4l3.3-3.4c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0L6.3 13c-.6.6-.5 1.4.1 1.8.3.2.6.3.9.3.4 0 .8-.2 1.1-.5l3.3-3.4c.2-.2.2-.5-.1-.7l-.2.3z" fill="#fff" />
          <path d="M14.5 8.7c-.2-.2-.5-.2-.7 0l-2.7 2.8c-.2.2-.2.5 0 .7.1.1.2.1.4.1.1 0 .3-.1.4-.2l2.7-2.8c.1-.1.1-.4-.1-.6zm-4 4.1c-.2-.2-.5-.2-.7 0l-2.7 2.8c-.1.1-.1.4.1.6.1.1.2.1.3.1.1 0 .3-.1.4-.2l2.7-2.8c.1-.2.1-.5-.1-.7v.2z" fill="#fff" />
        </svg>
      )

    case 'soundcloud':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M1.2 14.4c-.1 0-.2-.1-.2-.2v-2.4c0-.1.1-.2.2-.2s.2.1.2.2v2.4c0 .1-.1.2-.2.2zm1.2.6c-.1 0-.2-.1-.2-.2v-3.6c0-.1.1-.2.2-.2s.2.1.2.2v3.6c0 .1-.1.2-.2.2zm1.2.4c-.1 0-.2-.1-.2-.2v-4.4c0-.1.1-.2.2-.2s.2.1.2.2v4.4c0 .1-.1.2-.2.2zm1.2.3c-.1 0-.2-.1-.2-.2v-5c0-.1.1-.2.2-.2s.2.1.2.2v5c0 .1-.1.2-.2.2zm1.2.2c-.1 0-.2-.1-.2-.2V9.6c0-.1.1-.2.2-.2s.2.1.2.2v5.9c0 .1-.1.2-.2.2zm1.2-.1c-.1 0-.2-.1-.2-.2V9c0-.1.1-.2.2-.2s.2.1.2.2v6.2c0 .1-.1.2-.2.2zm1.2-.3c-.1 0-.2-.1-.2-.2V8.4c0-.1.1-.2.2-.2s.2.1.2.2v6.9c0 .1-.1.2-.2.2zm1.2.1c-.1 0-.2-.1-.2-.2V8.2c0-.1.1-.2.2-.2s.2.1.2.2v7.2c0 .1-.1.2-.2.2zm1.2.3h-.1c-.1 0-.1-.1-.1-.2V8c0-.1 0-.2.1-.2h.1c.1 0 .1.1.1.2v7.6c0 .1 0 .2-.1.2zm1.2.2c-3 0-5.5-2.5-5.5-5.5S11.2 5 14.2 5c2.1 0 3.9 1.2 4.8 2.9h.7c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3h-5.5z" fill="#FF5500" />
        </svg>
      )

    case 'deezer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="1" y="2" width="22" height="2.5" rx="1" fill="#A238FF" />
          <rect x="1" y="6" width="16" height="2.5" rx="1" fill="#A238FF" />
          <rect x="1" y="10" width="11" height="2.5" rx="1" fill="#A238FF" />
          <rect x="1" y="14" width="7" height="2.5" rx="1" fill="#A238FF" />
          <rect x="1" y="18" width="4" height="2.5" rx="1" fill="#A238FF" />
        </svg>
      )

    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.41.61.24 1.05.52 1.51.98.46.46.74.9.98 1.51.17.46.36 1.26.41 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.41 2.43-.24.61-.52 1.05-.98 1.51-.46.46-.9.74-1.51.98-.46.17-1.26.36-2.43.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.41a4.07 4.07 0 01-1.51-.98 4.07 4.07 0 01-.98-1.51c-.17-.46-.36-1.26-.41-2.43C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.41-2.43.24-.61.52-1.05.98-1.51.46-.46.9-.74 1.51-.98.46-.17 1.26-.36 2.43-.41C8.42 2.17 8.8 2.16 12 2.16z" stroke="#E4405F" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="4.5" stroke="#E4405F" strokeWidth="1.5" fill="none" />
          <circle cx="17.6" cy="6.4" r="1.2" fill="#E4405F" />
        </svg>
      )

    case 'rss':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="5" cy="19" r="2.5" fill="currentColor" />
          <path d="M5 12.5a6.5 6.5 0 016.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M5 7A12 12 0 0117 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      )

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

// Mini version for tight spaces (badges, tabs, inline) — colored icon at 12px
export function MiniPlatformIcon({ platform, size = 12, className }: PlatformIconProps) {
  switch (platform) {
    case 'spotify':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="12" fill="#1DB954"/><path d="M17.07 13.72c-2.37-1.46-6.48-1.62-8.82-.9-.38.12-.78-.1-.9-.47-.12-.38.1-.78.47-.9 2.7-.84 7.24-.68 10.02 1.02.34.2.45.64.25.98-.2.34-.64.45-.98.25z" fill="#fff"/><path d="M16.28 16.34c-1.95-1.2-5.35-1.6-7.82-.94-.32.1-.66-.08-.76-.4-.1-.32.08-.66.4-.76 2.84-.84 6.6-.4 8.88 1 .28.18.37.56.2.84-.18.28-.56.37-.84.2z" fill="#fff"/><path d="M15.56 18.84c-1.58-.97-4.32-1.28-6.4-.72-.26.07-.54-.08-.61-.34-.07-.26.08-.54.34-.61 2.34-.64 5.38-.3 7.22.82.24.14.31.44.17.66-.14.24-.44.31-.66.17z" fill="#fff"/></svg>

    case 'apple':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.46.26 3.62 1.98-.09.06-2.16 1.27-2.14 3.79.02 3.01 2.62 4.01 2.65 4.03-.02.07-.42 1.44-1.38 2.83z" fill="#fc3c44"/><path d="M15.57 5.36c.72-.88 1.22-2.1 1.08-3.32-1.05.04-2.32.7-3.07 1.58-.67.78-1.26 2.03-1.1 3.22 1.17.09 2.35-.59 3.09-1.48z" fill="#fc3c44"/></svg>

    case 'youtube':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81z" fill="#FF0000"/><path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#fff"/></svg>

    case 'tiktok':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.1a8.18 8.18 0 005.58 2.18V11.8a4.84 4.84 0 01-3.77-1.74V6.69h3.77z" fill="#fff"/><path d="M15.82 2v.44a4.83 4.83 0 003.77 4.25V5.08a4.83 4.83 0 01-3.77-3.08z" fill="#25F4EE"/><path d="M15.82 10.06A8.18 8.18 0 0112 8.44v6.56a6.34 6.34 0 01-5.5 3.86 6.3 6.3 0 01-3.32-.95 6.34 6.34 0 0010.64.75v-6.56z" fill="#FE2C55"/></svg>

    case 'twitter':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#e0e0e0"/></svg>

    case 'billboard':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><rect width="24" height="24" rx="4" fill="#E60026"/><path d="M5 7h2.5c1.4 0 2.5.8 2.5 2.2 0 .9-.5 1.5-1.2 1.8.9.3 1.5 1 1.5 2 0 1.5-1.2 2.5-2.8 2.5H5V7zm2.2 3.3c.8 0 1.3-.4 1.3-1s-.5-1-1.3-1H6.5v2h.7zm.2 3.7c.9 0 1.5-.5 1.5-1.2s-.6-1.2-1.5-1.2H6.5v2.4h.9zM13 7h1.5v6.5c0 1.4.8 2 2 2s2-.6 2-2V7H20v6.5c0 2.4-1.5 3.8-3.5 3.8S13 15.9 13 13.5V7z" fill="#fff"/></svg>

    case 'shazam':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="12" fill="#0E72ED"/><path d="M15.6 7.5c-.3-.2-.8-.2-1.1.1L11.2 11c-.2.2-.2.5 0 .7.2.2.5.2.7 0l3.3-3.4c.1-.1.3-.1.4 0 .1.1.1.3 0 .4L12.3 12c-.2.2-.2.5 0 .7.1.1.2.1.3.1s.3-.1.4-.2l3.3-3.4c.6-.6.5-1.3-.1-1.7z" fill="#fff"/><path d="M11.4 10.8c-.2-.2-.5-.2-.7 0L7.4 14.2c-.1.1-.3.1-.4 0-.1-.1-.1-.3 0-.4l3.3-3.4c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0L6.3 13c-.6.6-.5 1.4.1 1.8.3.2.6.3.9.3.4 0 .8-.2 1.1-.5l3.3-3.4c.2-.2.2-.5-.1-.7z" fill="#fff"/></svg>

    case 'soundcloud':
      return <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M1.2 14.4c-.1 0-.2-.1-.2-.2v-2.4c0-.1.1-.2.2-.2s.2.1.2.2v2.4c0 .1-.1.2-.2.2zm1.2.6c-.1 0-.2-.1-.2-.2v-3.6c0-.1.1-.2.2-.2s.2.1.2.2v3.6c0 .1-.1.2-.2.2zm1.2.4c-.1 0-.2-.1-.2-.2v-4.4c0-.1.1-.2.2-.2s.2.1.2.2v4.4c0 .1-.1.2-.2.2zm1.2.3c-.1 0-.2-.1-.2-.2v-5c0-.1.1-.2.2-.2s.2.1.2.2v5c0 .1-.1.2-.2.2zm1.2.2c-.1 0-.2-.1-.2-.2V9.6c0-.1.1-.2.2-.2s.2.1.2.2v5.9c0 .1-.1.2-.2.2zm1.2-.1c-.1 0-.2-.1-.2-.2V9c0-.1.1-.2.2-.2s.2.1.2.2v6.2c0 .1-.1.2-.2.2zm1.2-.3c-.1 0-.2-.1-.2-.2V8.4c0-.1.1-.2.2-.2s.2.1.2.2v6.9c0 .1-.1.2-.2.2zm1.2.1c-.1 0-.2-.1-.2-.2V8.2c0-.1.1-.2.2-.2s.2.1.2.2v7.2c0 .1-.1.2-.2.2zm1.2.3h-.1c-.1 0-.1-.1-.1-.2V8c0-.1 0-.2.1-.2h.1c.1 0 .1.1.1.2v7.6c0 .1 0 .2-.1.2zm1.2.2c-3 0-5.5-2.5-5.5-5.5S11.2 5 14.2 5c2.1 0 3.9 1.2 4.8 2.9h.7c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3h-5.5z" fill="#FF5500"/></svg>

    default:
      return <PlatformIcon platform={platform} size={size} className={className} />
  }
}

// Platform color and metadata helpers
export const PLATFORM_COLORS: Record<string, { color: string; rgb: string; dim: string }> = {
  spotify:    { color: '#1DB954', rgb: '29,185,84',   dim: 'rgba(29,185,84,0.1)' },
  apple:      { color: '#fc3c44', rgb: '252,60,68',   dim: 'rgba(252,60,68,0.1)' },
  youtube:    { color: '#FF0000', rgb: '255,0,0',     dim: 'rgba(255,0,0,0.1)' },
  tiktok:     { color: '#ff2d6b', rgb: '255,45,107',  dim: 'rgba(255,45,107,0.1)' },
  twitter:    { color: '#e0e0e0', rgb: '200,200,200', dim: 'rgba(200,200,200,0.1)' },
  billboard:  { color: '#E60026', rgb: '230,0,38',    dim: 'rgba(230,0,38,0.1)' },
  shazam:     { color: '#0E72ED', rgb: '14,114,237',  dim: 'rgba(14,114,237,0.1)' },
  soundcloud: { color: '#FF5500', rgb: '255,85,0',    dim: 'rgba(255,85,0,0.1)' },
}

export const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  youtube: 'YouTube Music',
  tiktok: 'TikTok',
  twitter: 'X',
  billboard: 'Billboard',
  shazam: 'Shazam',
  soundcloud: 'SoundCloud',
}
