import { unstable_cache } from 'next/cache'
import { normaliseLogoUrl } from './image-utils'
import { FALLBACK_COMPANY, companyMonogram, type Company } from './company-shared'
import { getSiteSettingsMap } from './site-settings'

export { FALLBACK_COMPANY, companyMonogram }
export type { Company }

function coerceString(v: unknown): string {
  if (typeof v === 'string') return v
  if (v == null) return ''
  return String(v)
}

async function fetchCompanyUncached(): Promise<Company> {
  try {
    const map = await getSiteSettingsMap()
    return {
      name: coerceString(map.site_name) || FALLBACK_COMPANY.name,
      tagline: coerceString(map.site_tagline) || FALLBACK_COMPANY.tagline,
      description: coerceString(map.site_description) || FALLBACK_COMPANY.description,
      logoUrl: normaliseLogoUrl(map.site_logo),
      heroImageUrl: normaliseLogoUrl(map.hero_image ?? map.site_hero),
      ogImageUrl: normaliseLogoUrl(map.og_image ?? map.site_og_image),
      contact: {
        email: coerceString(map.contact_email),
        phone: coerceString(map.contact_phone),
        address: coerceString(map.contact_address),
      },
      social: {
        facebook: coerceString(map.social_facebook),
        twitter: coerceString(map.social_twitter),
        instagram: coerceString(map.social_instagram),
      },
    }
  } catch (err) {
    console.error('[getCompany] failed:', err)
    return FALLBACK_COMPANY
  }
}

const companySlug = process.env.NEXT_PUBLIC_COMPANY_SLUG || 'plant-sanctuary'

const getCompanyCached = unstable_cache(fetchCompanyUncached, ['company', companySlug], {
  revalidate: 300,
})

/** Server-side brand record from site settings (includes `site_logo` synced from company logo). */
export async function getCompany(): Promise<Company> {
  return getCompanyCached()
}
