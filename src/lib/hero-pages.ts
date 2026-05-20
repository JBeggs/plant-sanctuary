/**
 * Storefront pages that may render an uploaded hero.
 */
export type HeroablePage = {
  slug: string
  label: string
  path: string
  description?: string
}

export const HEROABLE_PAGES: readonly HeroablePage[] = [
  {
    slug: 'home',
    label: 'Home',
    path: '/',
    description: 'Top hero on the landing page; falls back to company name and tagline when disabled.',
  },
  {
    slug: 'about',
    label: 'About',
    path: '/about',
    description: 'Optional banner at the top of the About page.',
  },
  {
    slug: 'products',
    label: 'Products',
    path: '/products',
    description: 'Optional banner above the product listing grid.',
  },
  {
    slug: 'contact',
    label: 'Contact',
    path: '/contact',
    description: 'Optional banner above the contact form.',
  },
  {
    slug: 'articles',
    label: 'Articles',
    path: '/articles',
    description: 'Optional banner above the care guides listing.',
  },
] as const

export function getHeroablePage(slug: string): HeroablePage | undefined {
  return HEROABLE_PAGES.find((p) => p.slug === slug)
}
