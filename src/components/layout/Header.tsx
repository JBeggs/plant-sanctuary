import Link from 'next/link'
import { MobileNav } from './MobileNav'
import ClientHeader from './ClientHeader'
import { BrandLogo } from './BrandLogo'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { getCompany } from '@/lib/company'

const menuItems = [
  { title: 'Plants', href: '/products' },
  { title: 'Care Guides', href: '/articles' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
]

export async function Header() {
  const company = await getCompany()

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="bg-brand-band text-on-brand">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-sm gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <span className="font-playfair italic truncate">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <ThemeToggle variant="icon" label="Store theme" />
              <Link href="/contact" className="hover:text-forest-accent transition-colors hidden sm:inline">Contact</Link>
              <Link href="/faq" className="hover:text-forest-accent transition-colors hidden sm:inline">FAQ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <BrandLogo
                logoUrl={company.logoUrl}
                companyName={company.name}
                width={48}
                height={48}
                className="rounded-lg object-cover shadow-md"
                priority
              />
              <div>
                <h1 className="text-xl font-bold font-playfair text-text">{company.name}</h1>
                {company.tagline ? (
                  <p className="text-sm text-text-muted italic">{company.tagline}</p>
                ) : null}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">Home</Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="hidden md:block">
              <ClientHeader />
            </div>
          </div>

          <MobileNav menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}
