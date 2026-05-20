'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import type { Company } from '@/lib/company-shared'

interface FooterClientProps {
  company: Company
  menuItems: Array<{ title: string; href: string }>
}

export default function FooterClient({ company, menuItems }: FooterClientProps) {
  const { contact, social } = company

  return (
    <footer className="bg-forest-primary text-white">
      <div className="container-wide">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <BrandLogo
                logoUrl={company.logoUrl}
                companyName={company.name}
                width={40}
                height={40}
                className="rounded-lg object-cover flex-shrink-0"
              />
              <span className="font-bold font-playfair text-lg group-hover:text-forest-accent transition-colors">
                {company.name}
              </span>
            </Link>
            <p className="text-green-100 mb-4">{company.description}</p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-forest-accent transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-forest-accent transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-forest-accent transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-green-100 hover:text-forest-accent transition-colors">All Plants</Link></li>
              {menuItems.slice(0, 3).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-green-100 hover:text-forest-accent transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/shipping" className="text-green-100 hover:text-forest-accent transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-green-100 hover:text-forest-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-green-100 hover:text-forest-accent transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-green-100 hover:text-forest-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="text-green-100 hover:text-forest-accent transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              {contact.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-green-200 mt-0.5" />
                  <span className="text-green-100 text-sm">{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-green-200" />
                  <span className="text-green-100">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-200" />
                  <span className="text-green-100">{contact.email}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-2">Secure Payments</h4>
              <p className="text-green-200 text-sm">Powered by Yoco</p>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-green-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-200 text-sm">
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-green-200 hover:text-forest-accent text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-green-200 hover:text-forest-accent text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
