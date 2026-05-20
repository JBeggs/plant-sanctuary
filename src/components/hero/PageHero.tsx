import 'server-only'
import type { ReactNode } from 'react'
import { getPageHero } from '@/lib/page-hero'
import PageHeroView from './PageHeroView'
import { getCompany } from '@/lib/company'

export default async function PageHero({
  pageSlug,
  fallback = null,
}: {
  pageSlug: string
  fallback?: ReactNode
}) {
  const hero = await getPageHero(pageSlug)
  if (!hero?.enabled || !hero.imageUrl) return <>{fallback}</>
  const company = pageSlug === 'home' ? await getCompany() : undefined
  return <PageHeroView hero={hero} pageSlug={pageSlug} company={company} />
}
