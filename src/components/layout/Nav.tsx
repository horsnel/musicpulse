'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'

const NAV_LINKS = [
  { href: '/',             label: 'Home',         icon: HomeIcon },
  { href: '/charts',       label: 'Charts',       icon: ChartsIcon },
  { href: '/trending',     label: 'Trending',     icon: TrendingIcon },
  { href: '/artists',      label: 'Artists',      icon: ArtistIcon },
  { href: '/new-releases', label: 'New Releases', icon: ReleasesIcon },
]

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className="sticky top-0 z-50 nav-glass border-b border-[var(--border)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 flex items-center h-16 gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-auto text-decoration-none">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#1DB954] to-[#0d8c3d] flex items-center justify-center flex-shrink-0">
            <WaveformIcon />
          </div>
          <span className="text-[17px] font-extrabold text-[var(--text)] tracking-[-0.03em]">
            Music<span className="text-[var(--green)]">Pulse</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-0.5 list-none">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 text-[13.5px] font-medium px-3.5 py-[7px] rounded-lg transition-all duration-150 no-underline tracking-[-0.01em]',
                    active
                      ? 'bg-[var(--bg3)] text-[var(--text)]'
                      : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]',
                  )}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Search */}
        <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 bg-[var(--bg3)] border border-[var(--border)] rounded-[10px] px-3 sm:px-3.5 py-2 cursor-pointer transition-all hover:border-[var(--border2)]">
          <SearchIcon />
          <span className="text-[13px] text-[var(--text3)] font-medium hidden sm:block">Search…</span>
          <kbd className="hidden sm:block text-[10px] bg-[var(--bg)] border border-[var(--border)] px-[5px] py-[2px] rounded font-mono text-[var(--text3)]">
            ⌘K
          </kbd>
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg3)] border border-[var(--border)] cursor-pointer transition-all hover:border-[var(--border2)]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[rgba(8,9,13,0.98)] backdrop-blur-xl">
          <div className="px-4 py-3">
            <ul className="list-none flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 text-[15px] font-semibold px-4 py-3 rounded-xl transition-all duration-150 no-underline',
                        active
                          ? 'bg-[var(--bg3)] text-[var(--text)]'
                          : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]',
                      )}
                    >
                      <Icon />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </nav>
  )
}

// ── SVG Icons ──────────────────────────────────────────────────
function WaveformIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="7" width="2.5" height="6" rx="1.25" fill="#000" />
      <rect x="6" y="4" width="2.5" height="12" rx="1.25" fill="#000" />
      <rect x="10" y="2" width="2.5" height="16" rx="1.25" fill="#000" />
      <rect x="14" y="5" width="2.5" height="10" rx="1.25" fill="#000" />
      <rect x="17.5" y="8" width="2.5" height="4" rx="1.25" fill="#000" />
    </svg>
  )
}
function HomeIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 11.5L3.5 7l3 3 3.5-5L14 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function ChartsIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1,11 4,6 7,9 10,4 13,2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
}
function TrendingIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10c1.2-3 2.8-3.5 4-2 1.2 1.5 2 0.8 3.3-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M7 4l3 0 0 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
}
function ArtistIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="5" y1="7.5" x2="5" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="9.5" x2="9" y2="8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
}
function ReleasesIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="7" cy="7" r="2" fill="currentColor"/><line x1="7" y1="1" x2="7" y2="3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#545670" strokeWidth="1.4" fill="none"/><line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="#545670" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="3" y1="5" x2="15" y2="5" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="9" x2="15" y2="9" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="13" x2="15" y2="13" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="4" y1="4" x2="14" y2="14" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="4" x2="4" y2="14" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
