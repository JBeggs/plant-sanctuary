import { ensureAbsoluteImageUrl } from '@/lib/image-utils'

export type PageHero = {
  id: string
  pageSlug: string
  enabled: boolean
  imageUrl: string | null
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
}

type ApiImage = {
  file_url?: string | null
  url?: string | null
} | null | undefined

export type ApiHero = {
  id?: string
  page_slug?: string
  enabled?: boolean
  image?: ApiImage
  title?: string | null
  subtitle?: string | null
  cta_label?: string | null
  cta_href?: string | null
}

function coerceString(v: unknown): string {
  if (typeof v === 'string') return v
  if (v == null) return ''
  return String(v)
}

export function normaliseImageUrl(image: ApiImage): string | null {
  if (!image || typeof image !== 'object') return null
  const raw = image.file_url ?? image.url
  if (!raw || typeof raw !== 'string') return null
  return ensureAbsoluteImageUrl(raw)
}

export function normaliseHero(row: ApiHero): PageHero | null {
  if (!row || typeof row !== 'object') return null
  const pageSlug = coerceString(row.page_slug).trim()
  if (!pageSlug) return null
  return {
    id: coerceString(row.id),
    pageSlug,
    enabled: Boolean(row.enabled),
    imageUrl: normaliseImageUrl(row.image),
    title: coerceString(row.title),
    subtitle: coerceString(row.subtitle),
    ctaLabel: coerceString(row.cta_label),
    ctaHref: coerceString(row.cta_href),
  }
}

export function unwrapPageHeroRows(raw: unknown): ApiHero[] {
  if (Array.isArray(raw)) return raw as ApiHero[]
  if (raw && typeof raw === 'object' && 'results' in raw) {
    const r = (raw as { results?: unknown }).results
    return Array.isArray(r) ? (r as ApiHero[]) : []
  }
  return []
}

/** Mirrors getPageHero selection: enabled row with image for the slug. */
export function pickActivePageHero(rows: ApiHero[], pageSlug: string): PageHero | null {
  for (const row of rows) {
    const hero = normaliseHero(row)
    if (!hero || hero.pageSlug !== pageSlug) continue
    if (!hero.enabled || !hero.imageUrl) continue
    return hero
  }
  return null
}
