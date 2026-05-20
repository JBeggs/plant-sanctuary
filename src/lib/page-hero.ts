import 'server-only'
import { cache } from 'react'
import { serverNewsApi } from '@/lib/api-server'
import {
  normaliseHero,
  pickActivePageHero,
  unwrapPageHeroRows,
  type PageHero,
} from '@/lib/page-hero-normalise'

export type { PageHero } from '@/lib/page-hero-normalise'

export const getPageHero = cache(async (pageSlug: string): Promise<PageHero | null> => {
  if (!pageSlug || typeof pageSlug !== 'string') return null
  try {
    const raw: unknown = await serverNewsApi.pageHeroes.listForPage(pageSlug)
    return pickActivePageHero(unwrapPageHeroRows(raw), pageSlug)
  } catch (err) {
    console.error('[getPageHero] failed:', err)
    return null
  }
})

export async function listAllPageHeroes(): Promise<PageHero[]> {
  try {
    const raw: unknown = await serverNewsApi.pageHeroes.list()
    const rows = unwrapPageHeroRows(raw)
    return rows.map(normaliseHero).filter((row): row is PageHero => row !== null)
  } catch (err) {
    console.error('[listAllPageHeroes] failed:', err)
    return []
  }
}
