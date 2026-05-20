'use client'

import { useState, type ImgHTMLAttributes } from 'react'
import { resolveMediaUrl, PLACEHOLDER_ASPECT } from '@/lib/media'
import { Placeholder, type PlaceholderKind } from './placeholders'

type MediaLike =
  | string
  | { url?: string; file_url?: string; media?: { url?: string; file_url?: string } }
  | null
  | undefined

interface SafeImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'placeholder'> {
  src?: MediaLike
  alt: string
  kind: PlaceholderKind
  monogram?: string
  enforceAspect?: boolean
  className?: string
  imgClassName?: string
  fill?: boolean
  priority?: boolean
  quality?: number
}

export default function SafeImage({
  src,
  alt,
  kind,
  monogram,
  enforceAspect = false,
  className,
  imgClassName,
  fill,
  priority: _priority,
  quality: _quality,
  sizes: _sizes,
  loading,
  decoding,
  ...imgProps
}: SafeImageProps) {
  const resolved = resolveMediaUrl(src)
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !resolved || failed

  const aspectStyle = enforceAspect
    ? { aspectRatio: PLACEHOLDER_ASPECT[kind] ?? '1 / 1' }
    : undefined

  const wrapperPositionClass = fill
    ? 'absolute inset-0 overflow-hidden'
    : 'relative overflow-hidden'

  return (
    <div
      className={[wrapperPositionClass, className ?? ''].join(' ')}
      style={aspectStyle}
    >
      {showPlaceholder ? (
        <Placeholder kind={kind} label={alt || undefined} monogram={monogram} />
      ) : (
        <img
          src={resolved!}
          alt={alt}
          onError={() => setFailed(true)}
          loading={loading ?? 'lazy'}
          decoding={decoding ?? 'async'}
          className={[
            fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full',
            'object-cover',
            imgClassName ?? '',
          ].join(' ')}
          {...imgProps}
        />
      )}
    </div>
  )
}
