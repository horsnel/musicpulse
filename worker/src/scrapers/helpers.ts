/**
 * Shared helpers for all scrapers
 */

const ART_GRADIENTS = [
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#642b73,#c6426e)',
  'linear-gradient(135deg,#134e5e,#71b280)',
  'linear-gradient(135deg,#c94b4b,#4b134f)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
  'linear-gradient(135deg,#4b1248,#f10711)',
  'linear-gradient(135deg,#1a4a6e,#2196f3)',
  'linear-gradient(135deg,#1a0a18,#381028)',
  'linear-gradient(135deg,#b85500,#ff8c00)',
  'linear-gradient(135deg,#6a1a6e,#b06cff)',
]

export function getArtGradient(index: number): string {
  return ART_GRADIENTS[index % ART_GRADIENTS.length]
}

const GENRE_EMOJIS: Record<string, string> = {
  'Pop': '\u{1F3B5}',
  'Hip-Hop': '\u{1F3A4}',
  'Rap': '\u{1F3A4}',
  'R&B': '\u{1F3B6}',
  'Country': '\u{1F338}',
  'Rock': '\u{1F3B8}',
  'K-Pop': '\u{1F338}',
  'Latin': '\u{1F525}',
  'Afrobeats': '\u{1F30D}',
  'Electronic': '\u{1F4AB}',
  'Dance': '\u{1F4AB}',
  'Alternative': '\u{1F3B6}',
  'Reggae': '\u{1F3BA}',
  'Jazz': '\u{1F3B7}',
  'Classical': '\u{1F3BB}',
  'Metal': '\u{1F3B8}',
}

export function getArtEmoji(genre?: string): string {
  return GENRE_EMOJIS[genre || ''] || '\u{1F3B5}'
}

/**
 * Improved slugify.
 *
 * Fixes two real bugs in the original:
 *  1. Non-ASCII characters were silently stripped — "José González" became "jos-gonzlez".
 *     Now we use Unicode NFD normalization to fold accents: "José González" → "jose-gonzalez".
 *  2. Parenthetical content like "(feat. Drake)" or "(Remix)" was kept, producing
 *     different slugs for the same song across sources. Now we strip them.
 */
export function slugify(str: string): string {
  return (str || '')
    .normalize('NFD')                        // Decompose accents: é -> e + combining mark
    .replace(/[\u0300-\u036f]/g, '')         // Strip combining marks
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')              // Strip parentheticals (feat. X), (Remix), etc.
    .replace(/\[[^\]]*\]/g, ' ')             // Strip bracketed content too
    .replace(/&/g, 'and')                    // & -> and
    .replace(/[^a-z0-9\s-]/g, ' ')           // Strip remaining non-ASCII
    .replace(/\s+/g, '-')                    // Spaces -> dashes
    .replace(/-+/g, '-')                     // Collapse repeated dashes
    .replace(/^-|-$/g, '')                   // Trim leading/trailing dash
    .trim()
}

/**
 * Normalize a slug (or partial slug from a URL) for matching against another slug.
 * Used by lookupSong / lookupArtist to be tolerant of slug differences across
 * scrapers and over time.
 */
export function normalizeSlugForLookup(slug: string): string {
  return (slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')   // Strip everything except alphanumerics — pure string compare
}

export function generateSparkline(rank: number): number[] {
  const base = Math.max(1, 101 - rank)
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(1, base - Math.floor(Math.random() * 20) + i * 2)
  )
}
