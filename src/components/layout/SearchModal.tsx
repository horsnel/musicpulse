'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MiniPlatformIcon } from '@/components/ui/PlatformIcons'
import { PLATFORM_LABELS } from '@/components/ui/PlatformIcons'
import type { TrendingPlatform } from '@/types'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

interface SearchResult {
  platform: TrendingPlatform
  songTitle: string
  artistName: string
  songId?: string
  artistSlug?: string
}

const PLATFORMS_TO_SEARCH = ['spotify', 'apple', 'youtube', 'tiktok', 'twitter', 'soundcloud', 'billboard'] as const

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Fetch trending data from all platforms when modal opens
  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)

    async function fetchAll() {
      const allResults: SearchResult[] = []

      await Promise.allSettled(
        PLATFORMS_TO_SEARCH.map(async (platform) => {
          try {
            const res = await fetch(
              `https://musicpulse-api.odehebuka48.workers.dev/api/trending?platform=${platform}&limit=5`
            )
            if (!res.ok) return
            const json = await res.json()
            const items = json?.data ?? json ?? []
            for (const item of items) {
              allResults.push({
                platform,
                songTitle: item.songTitle ?? '',
                artistName: item.artistName ?? '',
                songId: item.songId,
                artistSlug: item.artistSlug,
              })
            }
          } catch {
            // silently skip failed platforms
          }
        })
      )

      if (!cancelled) {
        setFetchedData(allResults)
        setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [open])

  // Filter results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase().trim()
    const filtered = fetchedData.filter(
      (r) =>
        r.songTitle.toLowerCase().includes(q) ||
        r.artistName.toLowerCase().includes(q)
    )
    setResults(filtered)
  }, [query, fetchedData])

  // Close on clicking backdrop (outside panel)
  function handleBackdropClick(e: React.MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  // Navigate and close
  function handleResultClick(platform: string, artistSlug?: string) {
    onClose()
  }

  // Group results by platform
  const grouped = results.reduce<Record<TrendingPlatform, SearchResult[]>>((acc, r) => {
    if (!acc[r.platform]) acc[r.platform] = []
    acc[r.platform].push(r)
    return acc
  }, {} as Record<TrendingPlatform, SearchResult[]>)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg mx-4 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] shadow-2xl overflow-hidden animate-fade-up"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text3)" strokeWidth="1.4" fill="none" />
            <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="var(--text3)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, platforms…"
            className="flex-1 bg-transparent text-[var(--text)] text-[14px] placeholder:text-[var(--text3)] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text3)] hover:text-[var(--text)] transition-colors text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="text-[10px] bg-[var(--bg)] border border-[var(--border)] px-[5px] py-[2px] rounded font-mono text-[var(--text3)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && !query && (
            <div className="px-4 py-8 text-center text-[var(--text3)] text-[13px]">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--text3)" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                </svg>
                Loading trending data…
              </div>
            </div>
          )}

          {!loading && !query && (
            <div className="px-4 py-8 text-center text-[var(--text3)] text-[13px]">
              Start typing to search across all platforms
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="px-4 py-8 text-center text-[var(--text3)] text-[13px]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {Object.entries(grouped).map(([platform, items]) => (
            <div key={platform}>
              {/* Platform Group Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg3)] border-y border-[var(--border)]">
                <MiniPlatformIcon platform={platform as TrendingPlatform} size={14} />
                <span className="text-[11px] font-semibold text-[var(--text2)] uppercase tracking-wider">
                  {PLATFORM_LABELS[platform] ?? platform}
                </span>
                <Link
                  href={`/trending/${platform}`}
                  onClick={() => onClose()}
                  className="ml-auto text-[10px] text-[var(--green)] hover:underline"
                >
                  View all →
                </Link>
              </div>

              {/* Results for this platform */}
              {items.map((item, i) => {
                const href = item.artistSlug
                  ? `/artists/${item.artistSlug}`
                  : `/trending/${platform}`
                return (
                  <Link
                    key={`${platform}-${i}-${item.songTitle}`}
                    href={href}
                    onClick={() => handleResultClick(platform, item.artistSlug)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg3)] transition-colors no-underline"
                  >
                    <MiniPlatformIcon platform={platform as TrendingPlatform} size={12} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[var(--text)] truncate">
                        {item.songTitle}
                      </div>
                      <div className="text-[11px] text-[var(--text3)] truncate">
                        {item.artistName}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Quick links when query is empty */}
          {!query && !loading && (
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-[var(--text3)] uppercase tracking-wider mb-2">
                Quick Links
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS_TO_SEARCH.map((p) => (
                  <Link
                    key={p}
                    href={`/trending/${p}`}
                    onClick={() => onClose()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg3)] border border-[var(--border)] text-[12px] text-[var(--text2)] hover:text-[var(--text)] hover:border-[var(--border2)] transition-colors no-underline"
                  >
                    <MiniPlatformIcon platform={p} size={12} />
                    {PLATFORM_LABELS[p] ?? p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
