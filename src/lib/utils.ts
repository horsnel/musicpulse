import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class merger — use everywhere instead of raw clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format large numbers: 1200000 → "1.2M", 890000 → "890K" */
export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

/** Format ms duration → "3:42" */
export function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Format ISO date → "Apr 27, 2025" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Format rank change for display */
export function formatRankChange(change: number, isNew: boolean): string {
  if (isNew) return 'NEW'
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return '—'
}

/**
 * Generate a slug from a string.
 *
 * Improved version (must stay in sync with worker/src/scrapers/helpers.ts):
 *  - NFD-normalize + strip combining marks so "José" → "jose" (not "jos")
 *  - Strip parentheticals like "(feat. X)" and "(Remix)" so the same song
 *    gets the same slug across sources.
 *  - "&" → "and" for consistency.
 */
export function slugify(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

/** Normalize a slug for tolerant matching (used to compare slugs across sources). */
export function normalizeSlugForLookup(slug: string): string {
  return (slug || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Map platform ID to display label */
export const PLATFORM_LABELS: Record<string, string> = {
  spotify:   'Spotify',
  apple:     'Apple Music',
  youtube:   'YouTube Music',
  shazam:    'Shazam',
  billboard: 'Billboard',
  tiktok:    'TikTok',
  twitter:   'X / Twitter',
}

/** Map region ID to flag emoji + display name */
export const REGION_META: Record<string, { flag: string; name: string }> = {
  global:       { flag: '🌍', name: 'Global' },
  nigeria:      { flag: '🇳🇬', name: 'Nigeria' },
  us:           { flag: '🇺🇸', name: 'United States' },
  uk:           { flag: '🇬🇧', name: 'United Kingdom' },
  africa:       { flag: '🌍', name: 'Africa' },
  brazil:       { flag: '🇧🇷', name: 'Brazil' },
  korea:        { flag: '🇰🇷', name: 'South Korea' },
  germany:      { flag: '🇩🇪', name: 'Germany' },
  'south-africa': { flag: '🇿🇦', name: 'South Africa' },
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Generate revalidation tag for ISR */
export function chartTag(platform: string, region: string): string {
  return `chart-${platform}-${region}`
}
