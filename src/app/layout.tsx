import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { AmbientBackground } from '@/components/layout/AmbientBackground'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'MusicPulse — Global Music Charts & Trends',
    template: '%s · MusicPulse',
  },
  description:
    'Real-time global music charts, trending songs, new releases, and artist profiles — updated every hour from Spotify, Apple Music, TikTok, and more.',
  keywords: ['music charts', 'trending songs', 'spotify charts', 'afrobeats', 'new releases'],
  openGraph: {
    type: 'website',
    siteName: 'MusicPulse',
    title: 'MusicPulse — Global Music Charts & Trends',
    description: 'Real-time charts, trending songs, and artist profiles. Updated every hour.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmbientBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
