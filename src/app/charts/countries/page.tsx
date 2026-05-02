import type { Metadata } from 'next'
import { getCountryCharts, getChartEntries } from '@/lib/data'
import { CountriesPageClient } from './CountriesPageClient'

export const metadata: Metadata = {
  title: 'Country Charts',
  description: 'Browse music charts by country — top songs and artists in 200+ countries worldwide.',
}

export default async function CountriesPage() {
  const [countryCharts, globalEntries] = await Promise.all([
    getCountryCharts(),
    getChartEntries('spotify', 'global', 10),
  ])

  return (
    <CountriesPageClient countries={countryCharts} featured={globalEntries} />
  )
}
