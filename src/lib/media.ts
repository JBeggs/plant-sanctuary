import { ensureAbsoluteImageUrl, extractImageUrl } from './image-utils'

export function resolveMediaUrl(
  v: string | { url?: string; file_url?: string; media?: { url?: string; file_url?: string } } | null | undefined,
): string | null {
  const raw = extractImageUrl(v)
  if (!raw) return null
  return ensureAbsoluteImageUrl(raw)
}

export const PLACEHOLDER_ASPECT: Record<string, string> = {
  logo: '1 / 1',
  hero: '16 / 9',
  gallery: '1 / 1',
  avatar: '1 / 1',
  category: '4 / 3',
  'product-square': '1 / 1',
  'product-landscape': '4 / 3',
}
