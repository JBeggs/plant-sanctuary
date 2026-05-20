'use client'

import Link from 'next/link'
import { ShoppingCart, LogOut, Palette, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useMounted } from '@/hooks/useMounted'
import { ProfileNavAvatar } from '@/components/layout/ProfileNavAvatar'

export default function ClientHeader() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const { itemCount } = useCart()
  const mounted = useMounted()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'business_owner'

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {user && (
        <Link
          href="/cart"
          className="p-2 text-text hover:text-forest-primary transition-colors relative group"
          aria-label="Shopping cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-forest-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
              {itemCount}
            </span>
          )}
        </Link>
      )}

          {user && isAdmin ? (
        <div className="hidden lg:flex items-center gap-4 mr-2">
          <Link href="/admin/inventory" className="text-sm font-medium text-text hover:text-forest-primary transition-colors">
            Inventory
          </Link>
          <Link href="/admin/branding" className="text-sm font-medium text-text hover:text-forest-primary transition-colors flex items-center gap-1">
            <Palette className="w-4 h-4" />
            Branding
          </Link>
          <Link href="/admin/orders" className="text-sm font-medium text-text hover:text-forest-primary transition-colors flex items-center gap-1">
            <ClipboardList className="w-4 h-4" />
            Orders
          </Link>
        </div>
      ) : null}

      {user ? (
        <div className="flex items-center space-x-3" data-cy="header-user">
          <Link
            href="/profile"
            className="p-2 text-text hover:text-forest-primary transition-colors"
            aria-label="Profile"
            data-cy="header-profile"
          >
            <ProfileNavAvatar profile={profile} user={user} size="sm" />
          </Link>
          <button
            onClick={() => signOut()}
            className="p-2 text-text hover:text-red-600 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      )}
    </div>
  )
}
