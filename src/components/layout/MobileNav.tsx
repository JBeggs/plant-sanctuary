'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User, Package, Palette, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMounted } from '@/hooks/useMounted'
import { getProfileDisplayName, ProfileNavAvatar } from '@/components/layout/ProfileNavAvatar'

interface MobileNavProps {
  menuItems: { title: string; href: string }[]
}

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const displayName = getProfileDisplayName(profile, user)
  const mounted = useMounted()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'business_owner'

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2">
        {mounted && user ? (
          <Link
            href="/profile"
            className="p-2 text-text hover:text-forest-primary transition-colors"
            aria-label="Profile"
            data-cy="mobile-header-profile"
            onClick={() => setIsOpen(false)}
          >
            <ProfileNavAvatar profile={profile} user={user} size="sm" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text hover:text-forest-primary transition-colors"
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="container-wide py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="nav-link py-2"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              {mounted && isAdmin ? (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Admin</p>
                  <Link href="/admin/inventory" className="nav-link flex items-center gap-2 py-2" onClick={() => setIsOpen(false)}>
                    <Package className="w-5 h-5 shrink-0" />
                    Inventory
                  </Link>
                  <Link href="/admin/branding" className="nav-link flex items-center gap-2 py-2" onClick={() => setIsOpen(false)}>
                    <Palette className="w-5 h-5 shrink-0" />
                    Branding &amp; Heroes
                  </Link>
                  <Link href="/admin/orders" className="nav-link flex items-center gap-2 py-2" onClick={() => setIsOpen(false)}>
                    <ClipboardList className="w-5 h-5 shrink-0" />
                    Orders
                  </Link>
                </div>
              ) : null}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Account
                </p>
                {mounted && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <ProfileNavAvatar profile={profile} user={user} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                        {user.email ? (
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 nav-link py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5 shrink-0" />
                      <span>Profile &amp; settings</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center gap-2 nav-link py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingCart className="w-5 h-5 shrink-0" />
                      <span>Cart</span>
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left nav-link py-2 text-red-600"
                      onClick={() => {
                        void signOut()
                        setIsOpen(false)
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : mounted ? (
                  <Link
                    href="/login"
                    className="btn btn-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                ) : null}
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
