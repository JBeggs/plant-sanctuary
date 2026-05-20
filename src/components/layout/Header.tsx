import Link from 'next/link'
import { MobileNav } from './MobileNav'
import ClientHeader from './ClientHeader'
import { BrandLogo } from './BrandLogo'
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-forest-primary text-white">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-playfair italic">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/contact" className="hover:text-forest-accent transition-colors">Contact</Link>
              <Link href="/faq" className="hover:text-forest-accent transition-colors">FAQ</Link>
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
