import Link from 'next/link'
import { BookOpen, Home, Leaf, Sprout } from 'lucide-react'
import SafeImage from '@/components/media/SafeImage'
import type { PageHero } from '@/lib/page-hero'
import type { Company } from '@/lib/company-shared'

const HERO_SECTION_LAYOUT =
  'relative overflow-hidden flex flex-col justify-center min-h-[24rem] sm:min-h-[28rem] md:min-h-[32rem]'

export default function PageHeroView({
  hero,
  pageSlug,
  company,
}: {
  hero: PageHero
  pageSlug: string
  company?: Company
}) {
  const isHome = pageSlug === 'home'
  const hasCta = Boolean(hero.ctaLabel && hero.ctaHref)

  const heading =
    (isHome && (hero.title?.trim() || company?.name)) ||
    (!isHome && hero.title?.trim()) ||
    null

  return (
    <section className={HERO_SECTION_LAYOUT}>
      <div className="absolute inset-0">
        <SafeImage
          src={hero.imageUrl}
          alt=""
          kind="hero"
          fill
          priority
          className="absolute inset-0"
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 hero-gradient-overlay" aria-hidden />
      </div>

      <div className="relative container-wide py-24 md:py-32 text-white w-full">
        <div className="max-w-2xl">
          {heading && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">{heading}</h1>
          )}

          {isHome && company ? (
            hero.subtitle?.trim() ? (
              <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">{hero.subtitle}</p>
            ) : (
              <>
                {company.tagline && (
                  <p className="text-base md:text-lg uppercase tracking-[0.25em] text-green-100 mb-6">
                    {company.tagline}
                  </p>
                )}
                {company.description && (
                  <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">{company.description}</p>
                )}
              </>
            )
          ) : (
            hero.subtitle?.trim() && (
              <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">{hero.subtitle}</p>
            )
          )}

          {isHome && (
            <div className="flex flex-wrap gap-4">
              {hasCta && (
                <Link href={hero.ctaHref!} className="btn bg-white text-forest-primary hover:bg-gray-100 text-base px-6 py-3">
                  {hero.ctaLabel}
                </Link>
              )}
              <Link href="/products" className="btn bg-forest-accent text-white hover:bg-forest-accent-dark text-base px-6 py-3">
                <Leaf className="w-5 h-5 mr-2" />
                Shop Plants
              </Link>
              <Link href="/products?tags=indoor" className="btn bg-white text-forest-primary hover:bg-gray-100 text-base px-6 py-3">
                <Home className="w-5 h-5 mr-2" />
                Indoor
              </Link>
              <Link href="/products?tags=succulents" className="btn bg-white text-forest-primary hover:bg-gray-100 text-base px-6 py-3">
                <Sprout className="w-5 h-5 mr-2" />
                Succulents
              </Link>
              <Link href="/articles" className="btn bg-white text-forest-primary hover:bg-gray-100 text-base px-6 py-3">
                <BookOpen className="w-5 h-5 mr-2" />
                Care Guides
              </Link>
            </div>
          )}

          {!isHome && hasCta && (
            <div className="flex flex-wrap gap-4">
              <Link href={hero.ctaHref!} className="btn bg-forest-accent text-white hover:bg-forest-accent-dark text-base px-6 py-3">
                {hero.ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
