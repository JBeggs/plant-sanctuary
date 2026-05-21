import { describe, expect, it, vi, beforeEach } from 'vitest'
import { normaliseLogoUrl } from './image-utils'

/** unstable_cache needs Next incremental cache — pass through in Vitest. */
vi.mock('next/cache', () => ({
  unstable_cache: <T extends () => Promise<unknown>>(fn: T) => fn,
}))

vi.mock('./site-settings', () => ({
  getSiteSettingsMap: vi.fn(),
}))

import { getSiteSettingsMap } from './site-settings'
import { getCompany } from './company'

describe('normaliseLogoUrl', () => {
  it('resolves /media paths to absolute backend URLs', () => {
    const url = normaliseLogoUrl('/media/logos/tree.png')
    expect(url).toContain('/media/logos/tree.png')
    expect(url).toMatch(/^https?:\/\//)
  })

  it('passes through https URLs', () => {
    expect(normaliseLogoUrl('https://cdn.example.com/logo.png')).toBe(
      'https://cdn.example.com/logo.png'
    )
  })
})

describe('getCompany', () => {
  beforeEach(() => {
    vi.mocked(getSiteSettingsMap).mockReset()
  })

  it('reads site_logo for header/footer branding', async () => {
    vi.mocked(getSiteSettingsMap).mockResolvedValue({
      site_name: 'Green House',
      site_tagline: 'Indoor plants',
      site_description: 'Care guides',
      site_logo: 'https://3pillars.pythonanywhere.com/media/logo.png',
    })

    const company = await getCompany()
    expect(company.name).toBe('Green House')
    expect(company.logoUrl).toBe('https://3pillars.pythonanywhere.com/media/logo.png')
  })
})
