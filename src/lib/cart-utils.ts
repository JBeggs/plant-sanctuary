import type { Cart, CartItem } from './types'
import {
  ensureAbsoluteImageUrl,
  getProductGalleryThumbImages,
  getPublicImageUrl,
  MAX_BUNDLE_PRODUCT_IMAGES,
} from './image-utils'

export function normalizeCartResponse(response: unknown): Cart | null {
  if (!response) return null
  const r = response as { results?: Cart[]; data?: Cart }
  if (r?.results && Array.isArray(r.results)) return r.results[0] ?? null
  if (r?.data) return r.data ?? null
  return response as Cart
}

/** Thumbnail URLs for cart line items (proxied, thumb-first). */
export function getCartItemImages(item: CartItem): string[] {
  const itemAny = item as CartItem & {
    bundle_images?: unknown[]
    is_bundle?: boolean
  }
  const bundleImages = Array.isArray(itemAny.bundle_images) ? itemAny.bundle_images : []
  const parsedBundleImages = bundleImages
    .map((img: unknown) => (typeof img === 'string' ? img : (img as { url?: string })?.url || ''))
    .filter(Boolean) as string[]
  const main = item.product_image || item.product?.image || ''
  const rawFull =
    itemAny.is_bundle && parsedBundleImages.length > 0
      ? parsedBundleImages
      : [main, ...parsedBundleImages].filter(Boolean)
  const fullUrls = rawFull.map(ensureAbsoluteImageUrl).slice(0, MAX_BUNDLE_PRODUCT_IMAGES)
  const nested = item.product as
    | { image_thumbnail?: string | null; image_thumbnails?: string[] | null }
    | undefined
  return getProductGalleryThumbImages(fullUrls, {
    image_thumbnail: nested?.image_thumbnail,
    image_thumbnails: nested?.image_thumbnails,
  }).map(getPublicImageUrl)
}
