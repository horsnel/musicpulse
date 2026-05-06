import type { Metadata } from 'next'
import {
  getTrending, getCrossPlatformScores,
  getVelocityItems, getGenreHeatmap,
} from '@/lib/data'
import { TrendingPageClient } from './TrendingPageClient'

export const metadata: Metadata = {
  title: 'Trending Now',
  description:
    'Live trending music data from TikTok, Twitter/X, YouTube, Spotify, Apple Music, Deezer, SoundCloud, Billboard, Bandcamp, Audiomack, Genius, Musixmatch, iHeartRadio, Melon, and Oricon — updated every 2 hours.',
}

export default async function TrendingPage() {
  const [tiktok, twitter, youtube, spotify, apple, deezer, soundcloud, billboard, bandcamp, audiomack, genius, musixmatch, iheart, melon, oricon, crossPlatform, velocity, heatmap] =
    await Promise.all([
      getTrending('tiktok', 8),
      getTrending('twitter', 8),
      getTrending('youtube', 8),
      getTrending('spotify', 5),
      getTrending('apple', 6),
      getTrending('deezer', 5),
      getTrending('soundcloud', 5),
      getTrending('billboard', 5),
      getTrending('bandcamp', 5),
      getTrending('audiomack', 5),
      getTrending('genius', 5),
      getTrending('musixmatch', 5),
      getTrending('iheart', 5),
      getTrending('melon', 5),
      getTrending('oricon', 5),
      getCrossPlatformScores(5),
      getVelocityItems(5),
      getGenreHeatmap(),
    ])

  return (
    <TrendingPageClient
      tiktok={tiktok}
      twitter={twitter}
      youtube={youtube}
      spotify={spotify}
      apple={apple}
      deezer={deezer}
      soundcloud={soundcloud}
      billboard={billboard}
      bandcamp={bandcamp}
      audiomack={audiomack}
      genius={genius}
      musixmatch={musixmatch}
      iheart={iheart}
      melon={melon}
      oricon={oricon}
      crossPlatform={crossPlatform}
      velocity={velocity}
      heatmap={heatmap}
    />
  )
}
