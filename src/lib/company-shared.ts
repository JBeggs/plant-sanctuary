export interface Company {
  name: string
  tagline: string
  description: string
  logoUrl: string | null
  heroImageUrl: string | null
  ogImageUrl: string | null
  contact: {
    email: string
    phone: string
    address: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
  }
}

export const FALLBACK_COMPANY: Company = {
  name: 'Plant Sanctuary',
  tagline: 'Plants & Care',
  description: 'Discover beautiful plants and expert care guides. Bring nature home with Plant Sanctuary.',
  logoUrl: null,
  heroImageUrl: null,
  ogImageUrl: null,
  contact: { email: '', phone: '', address: '' },
  social: { facebook: '', twitter: '', instagram: '' },
}

export function companyMonogram(name: string): string {
  const trimmed = (name || '').trim()
  if (!trimmed) return 'PS'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}
