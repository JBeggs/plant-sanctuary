import Image from 'next/image'

type BrandLogoProps = {
  logoUrl: string | null
  companyName: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

/** Company logo from site settings, static fallback, or monogram initials. */
export function BrandLogo({
  logoUrl,
  companyName,
  width,
  height,
  className = 'rounded-lg object-cover flex-shrink-0',
  priority = false,
}: BrandLogoProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Django media URLs; avoids optimizer issues
      <img
        src={logoUrl}
        alt=""
        width={width}
        height={height}
        className={className}
        decoding="async"
      />
    )
  }

  const staticLogo = '/logo.webp'
  return (
    <Image
      src={staticLogo}
      alt=""
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
