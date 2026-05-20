import { describe, it, expect } from 'vitest'
import {
  normaliseHero,
  normaliseImageUrl,
  unwrapPageHeroRows,
  pickActivePageHero,
} from './page-hero-normalise'

describe('page-hero normalisation', () => {
  it('unwrapPageHeroRows accepts array and paginated results', () => {
    expect(unwrapPageHeroRows([{ page_slug: 'home' }])).toHaveLength(1)
    expect(unwrapPageHeroRows({ results: [{ page_slug: 'about' }] })).toHaveLength(1)
    expect(unwrapPageHeroRows(null)).toEqual([])
  })

  it('normaliseHero maps API snake_case to PageHero', () => {
    const hero = normaliseHero({
      id: '1',
      page_slug: 'home',
      enabled: true,
      image: { file_url: '/media/hero.jpg' },
      title: 'Welcome',
      subtitle: 'Plants',
      cta_label: 'Shop',
      cta_href: '/products',
    })
    expect(hero).toMatchObject({
      id: '1',
      pageSlug: 'home',
      enabled: true,
      title: 'Welcome',
      subtitle: 'Plants',
      ctaLabel: 'Shop',
      ctaHref: '/products',
    })
    expect(hero?.imageUrl).toContain('/media/hero.jpg')
  })

  it('normaliseHero returns null without page_slug', () => {
    expect(normaliseHero({ id: '1', enabled: true })).toBeNull()
  })

  it('normaliseImageUrl prefers file_url then url', () => {
    expect(normaliseImageUrl({ file_url: '/a.jpg' })).toContain('/a.jpg')
    expect(normaliseImageUrl({ url: '/b.jpg' })).toContain('/b.jpg')
    expect(normaliseImageUrl(null)).toBeNull()
  })

  it('pickActivePageHero returns enabled hero with image only', () => {
    const rows = [
      { page_slug: 'home', enabled: false, image: { file_url: '/x.jpg' } },
      { page_slug: 'home', enabled: true, image: { file_url: '/hero.jpg' }, id: 'h1' },
    ]
    const picked = pickActivePageHero(rows, 'home')
    expect(picked?.id).toBe('h1')
    expect(picked?.imageUrl).toContain('/hero.jpg')
  })

  it('pickActivePageHero returns null when disabled or missing image', () => {
    expect(
      pickActivePageHero([{ page_slug: 'home', enabled: true }], 'home'),
    ).toBeNull()
    expect(
      pickActivePageHero(
        [{ page_slug: 'home', enabled: false, image: { file_url: '/x.jpg' } }],
        'home',
      ),
    ).toBeNull()
  })
})
