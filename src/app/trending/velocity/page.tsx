import type { Metadata } from 'next'
import { getVelocityItems } from '@/lib/data'
import { VelocityPageClient } from './VelocityPageClient'

export const metadata: Metadata = {
  title: 'Viral Velocity — Fastest Rising',
  description: 'The fastest-rising songs across all platforms — discover tracks gaining momentum right now with real-time growth data.',
}

export default async function VelocityPage() {
  const velocity = await getVelocityItems(25)

  return <VelocityPageClient velocity={velocity} />
}
