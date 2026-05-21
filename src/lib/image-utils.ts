const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'

function getBackendOrigin(): string {
  try {
    const url = new URL(API_BASE_URL)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'https://3pillars.pythonanywhere.com'
  }
}

/** Resolve backend media paths and relative URLs for use in <img src>. */
export function ensureAbsoluteImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/media/')) return getBackendOrigin() + url
  if (url.startsWith('/')) return url
  return url
}

export function extractImageUrl(
  v: string | { url?: string; file_url?: string; media?: { url?: string; file_url?: string } } | null | undefined,
): string | null {
  if (!v) return null
  if (typeof v === 'string' && v) return v
  if (typeof v === 'object' && v) {
    const obj = v as Record<string, unknown>
    let u: unknown = obj.url ?? obj.file_url
    if (u == null && obj.media && typeof obj.media === 'object') {
      const media = obj.media as Record<string, unknown>
      u = media.url ?? media.file_url
    }
    if (typeof u === 'string' && u) return u
  }
  return null
}

export function normaliseLogoUrl(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'string' && v.trim()) return ensureAbsoluteImageUrl(v.trim())
  if (typeof v === 'object' && v !== null) {
    const obj = v as Record<string, unknown>
    const raw = obj.url ?? obj.file_url
    if (typeof raw === 'string' && raw.trim()) return ensureAbsoluteImageUrl(raw.trim())
  }
  return null
}

export const ARTICLE_IMAGE_PLACEHOLDER = '/images/products/default.svg'

function pickArticleShareImageRaw(article?: {
  social_image?: { file_url?: string | null } | null
  featured_media?: { file_url?: string | null } | null
} | null): string | null {
  const social = article?.social_image?.file_url?.trim()
  if (social) return social
  const featured = article?.featured_media?.file_url?.trim()
  if (featured) return featured
  return null
}

export function getArticleImageUrl(
  article?: {
    social_image?: { file_url?: string | null } | null
    featured_media?: { file_url?: string | null } | null
  } | null,
): string {
  const raw = pickArticleShareImageRaw(article || undefined)
  if (raw) return ensureAbsoluteImageUrl(raw)
  return ARTICLE_IMAGE_PLACEHOLDER
}

export function getArticleOpenGraphImageUrls(
  article?: {
    social_image?: { file_url?: string | null } | null
    featured_media?: { file_url?: string | null } | null
  } | null,
): string[] {
  const raw = pickArticleShareImageRaw(article || undefined)
  if (raw) {
    return [ensureAbsoluteImageUrl(raw)]
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (site) {
    return [`${site}${ARTICLE_IMAGE_PLACEHOLDER}`]
  }
  return []
}

