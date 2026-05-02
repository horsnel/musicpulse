import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ─── BADGE ─────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'pink' | 'blue' | 'gold' | 'purple' | 'ghost'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  green:  'bg-[var(--green-dim)] border-[rgba(29,185,84,0.25)] text-[var(--green)]',
  pink:   'bg-[var(--pink-dim)] border-[rgba(255,45,107,0.25)] text-[var(--pink)]',
  blue:   'bg-[var(--blue-dim)] border-[rgba(67,97,255,0.25)] text-[var(--blue)]',
  gold:   'bg-[var(--gold-dim)] border-[rgba(255,184,48,0.25)] text-[var(--gold)]',
  purple: 'bg-[var(--purple-dim)] border-[rgba(176,108,255,0.25)] text-[var(--purple)]',
  ghost:  'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text3)]',
}

export function Badge({ children, variant = 'ghost', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-[100px] px-3 py-1',
        'text-[11px] font-bold tracking-[0.06em] uppercase',
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── LIVE DOT ──────────────────────────────────────────────────
export function LiveDot({ color = 'var(--green)' }: { color?: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full pulse-dot"
      style={{ background: color }}
    />
  )
}

// ─── CARD ──────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'mp-card',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-[22px] py-[18px] border-b border-[var(--border)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── STAT BOX ──────────────────────────────────────────────────
interface StatBoxProps {
  label: string
  value: string
  sub?: string
  trend?: { value: string; up: boolean }
  icon?: ReactNode
  className?: string
}

export function StatBox({ label, value, sub, trend, icon, className }: StatBoxProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg2)] px-6 py-5 flex flex-col gap-1 transition-colors hover:bg-[var(--bg3)] cursor-default',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text3)]">
        {icon}
        {label}
      </div>
      <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--text)] mt-0.5">
        {value}
      </div>
      {sub && <div className="text-[11px] text-[var(--text3)] font-medium mt-0.5">{sub}</div>}
      {trend && (
        <div
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-bold mt-1',
            trend.up ? 'text-[var(--green)]' : 'text-[var(--pink)]',
          )}
        >
          {trend.up ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <polyline points="1,8 4.5,3.5 8,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <polyline points="1,3.5 4.5,7 8,4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
          {trend.value}
        </div>
      )}
    </div>
  )
}

// ─── SECTION HEADER ────────────────────────────────────────────
interface SectionHeaderProps {
  title: string
  icon?: ReactNode
  action?: { label: string; href: string }
  iconBg?: string
}

export function SectionHeader({ title, icon, action, iconBg }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-0.03em]">
        {icon && (
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
        )}
        {title}
      </div>
      {action && (
        <a
          href={action.href}
          className="flex items-center gap-1 text-[13px] font-semibold text-[var(--text3)] no-underline px-3.5 py-[7px] border border-[var(--border)] rounded-lg transition-all hover:border-[var(--border2)] hover:text-[var(--text2)]"
        >
          {action.label}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <polyline points="6.5,2.5 10,6 6.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
        </a>
      )}
    </div>
  )
}

// ─── TABS ──────────────────────────────────────────────────────
interface TabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-0.5 bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-[3px] w-fit',
        className,
      )}
    >
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'px-[18px] py-2 rounded-[9px] text-[13px] font-semibold tracking-[-0.01em] transition-all border-none cursor-pointer',
            tab === active
              ? 'bg-[var(--bg3)] text-[var(--text)] shadow-sm'
              : 'text-[var(--text3)] hover:text-[var(--text2)] bg-transparent',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── PLAYING BARS ──────────────────────────────────────────────
export function PlayingBars({ color = 'var(--green)' }: { color?: string }) {
  return (
    <div className="playing-bars">
      {[0, 0.15, 0.3, 0.1].map((delay, i) => (
        <span key={i} style={{ animationDelay: `${delay}s`, background: color }} />
      ))}
    </div>
  )
}

// ─── RANK DISPLAY ──────────────────────────────────────────────
export function RankNumber({ rank }: { rank: number }) {
  const cls =
    rank === 1 ? 'rank-gold' :
    rank === 2 ? 'rank-silver' :
    rank === 3 ? 'rank-bronze' :
    'text-[var(--text3)]'

  return (
    <span className={cn('text-[18px] font-black tracking-[-0.03em] leading-none', cls)}>
      {rank}
    </span>
  )
}
