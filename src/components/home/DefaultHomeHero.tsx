import Link from 'next/link'
import { BookOpen, Home, Leaf, Sprout } from 'lucide-react'
import SafeImage from '@/components/media/SafeImage'
import type { Company } from '@/lib/company-shared'

const HERO_SECTION_LAYOUT =
  'relative overflow-hidden flex flex-col justify-center min-h-[24rem] sm:min-h-[28rem] md:min-h-[32rem]'

export default function DefaultHomeHero({ company }: { company: Company }) {
  return (
    <section className={HERO_SECTION_LAYOUT}>
      <div className="absolute inset-0">
        <SafeImage
          src={company.heroImageUrl}
          alt=""
          kind="hero"
          fill
          priority
          className="absolute inset-0"
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-primary/90 to-forest-primary-dark/95" aria-hidden />
      </div>

      <div className="relative container-wide py-20 md:py-28 text-white w-full">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-6">
            {company.name}
          </h1>
          {company.tagline ? (
            <p className="text-base md:text-lg uppercase tracking-[0.2em] text-green-100 mb-4">
              {company.tagline}
            </p>
          ) : null}
          <p className="text-xl text-green-100 mb-8">
            {company.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="btn bg-forest-accent text-white hover:bg-forest-accent-dark">
              <Leaf className="w-5 h-5 mr-2" />
              Shop Plants
            </Link>
            <Link href="/products?tags=indoor" className="btn bg-white text-forest-primary hover:bg-gray-100">
              <Home className="w-5 h-5 mr-2" />
              Indoor
            </Link>
            <Link href="/products?tags=succulents" className="btn bg-white text-forest-primary hover:bg-gray-100">
              <Sprout className="w-5 h-5 mr-2" />
              Succulents
            </Link>
            <Link href="/articles" className="btn bg-white text-forest-primary hover:bg-gray-100">
              <BookOpen className="w-5 h-5 mr-2" />
              Care Guides
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
