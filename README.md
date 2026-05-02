# 🎵 MusicPulse

Real-time global music charts, trending songs, artist profiles, and new releases — built on **Next.js 14 App Router** + **Cloudflare Workers + D1**.

---

## Pages

| Route | Description | Rendering |
|---|---|---|
| `/` | Homepage — hero, charts, trending, releases, artists | ISR 1h |
| `/charts` | Full chart table with platform tabs + country selector | ISR 1h |
| `/charts?platform=apple&region=nigeria` | Country/platform filtered chart | ISR 1h |
| `/trending` | TikTok, Twitter, YouTube columns + velocity + heatmap | ISR 2h |
| `/artists/[slug]` | Artist profile — bio, top songs, discography, facts | ISR 24h |
| `/songs/[slug]` | Song detail — chart history, stats, streaming links | ISR 1h |
| `/new-releases` | New album and single releases this week | ISR 6h |

---

## Tech Stack

```
Frontend          Next.js 14 (App Router) + TypeScript
Styling           Tailwind CSS + CSS custom properties
Hosting           Cloudflare Pages
Database          Cloudflare D1 (SQLite at the edge)
Cache             Cloudflare KV (ISR tag-based invalidation)
Cron scrapers     Cloudflare Workers (6 workers, separate entry points)
Fonts             Inter + Space Grotesk + Playfair Display (Google Fonts)
```

---

## Data Sources (all free)

| Source | What we scrape | Update frequency |
|---|---|---|
| `charts.spotify.com` | Daily Top 200 CSV per country | Every 1h |
| Apple Music RSS | Top 100 songs + new releases | Every 6h |
| Last.fm API | Artist bio, top tracks, similar artists | Daily |
| MusicBrainz API | Album metadata, tracklists, release dates | On demand |
| TikTok Creative Center | Trending sounds + usage counts | Every 2h |
| Nitter (Twitter) | Music hashtag trends | Every 3h |
| YouTube Charts | Top music videos | Every 2h |

---

## Project Structure

```
musicpulse/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (Nav + Footer + fonts)
│   │   ├── page.tsx           # Homepage
│   │   ├── charts/
│   │   │   ├── page.tsx       # Server component (data fetching)
│   │   │   └── ChartsPageClient.tsx  # Client component (interactive)
│   │   ├── trending/
│   │   │   ├── page.tsx
│   │   │   └── TrendingPageClient.tsx
│   │   ├── artists/[slug]/
│   │   │   └── page.tsx
│   │   └── songs/[slug]/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/            # Nav, Footer, AmbientBackground, HeroSection
│   │   ├── ui/                # Badge, Card, StatBox, Tabs, PlayingBars...
│   │   ├── charts/            # ChartsGrid, MiniSparkline
│   │   ├── trending/          # TrendingRow, TrendingColumn
│   │   ├── artist/            # ArtistsRow, ArtistCard
│   │   └── song/              # ReleasesGrid, SongRow
│   ├── lib/
│   │   ├── data.ts            # All data fetching (mock → real D1)
│   │   └── utils.ts           # formatCount, formatDuration, cn(), slugify...
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css        # Design tokens, shared animations
│   └── workers/               # Cloudflare cron Workers
│       ├── charts-scraper.worker.ts
│       └── trending-scraper.worker.ts
├── schema.sql                 # D1 database schema
├── wrangler.toml              # Cloudflare config
├── .env.example               # Environment variable template
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Copy environment variables

```bash
cp .env.example .env.local
# Fill in LASTFM_API_KEY and GENIUS_TOKEN (both free)
```

### 3. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

The app runs fully on **mock data** by default (`NEXT_PUBLIC_USE_MOCK=true`).
No database or API keys needed to see all 5 pages working.

---

## Deploying to Cloudflare

### Step 1 — Create D1 database

```bash
npx wrangler d1 create musicpulse-db
# Copy the database_id output into wrangler.toml
```

### Step 2 — Run the schema

```bash
npx wrangler d1 execute musicpulse-db --file=schema.sql
```

### Step 3 — Create KV namespace

```bash
npx wrangler kv:namespace create CACHE
# Copy the id into wrangler.toml
```

### Step 4 — Deploy Workers

```bash
npx wrangler deploy
```

### Step 5 — Deploy Pages

Connect your GitHub repo to **Cloudflare Pages**:
- Framework: **Next.js**
- Build command: `npm run build`
- Output directory: `.next`
- Set environment variables in the Pages dashboard

---

## Switching from Mock to Live Data

In `src/lib/data.ts`, change:

```ts
const USE_MOCK = true   // → false
```

Each function will then call `/api/*` route handlers, which query D1.
The Workers cron jobs populate D1 automatically on schedule.

---

## SEO

Every page exports `metadata` or `generateMetadata` with:
- Title template: `{Page} · MusicPulse`
- OpenGraph tags
- Twitter card
- `robots: index, follow`
- Schema.org structured data (add via `next-seo` or inline `<script type="application/ld+json">`)

The sitemap is auto-generated weekly by `sitemap-generator.worker.ts` and submitted to Google Search Console.

---

## Monetization

| Month | Method | Target |
|---|---|---|
| 1–2 | Google AdSense (apply once you have 20+ posts) | $50–200/mo |
| 2–3 | Spotify + Apple Music affiliate links on every song page | $100–400/mo |
| 3+ | Weekly Charts Digest newsletter sponsorships | $200–1,000/mo |

---

## License

MIT
