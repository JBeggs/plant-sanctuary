'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ecommerceApi, newsApi, getApiErrorMessage } from '@/lib/api'
import { Order } from '@/lib/types'
import { useToast } from '@/contexts/ToastContext'
import {
  Package,
  User,
  Calendar,
  ChevronRight,
  Loader2,
  Save,
  Building2,
  UserCircle,
  ShoppingBag,
  Globe,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import ProfileOwnerTabs from './ProfileOwnerTabs'

type OwnerTabId = 'business' | 'site' | 'integrations'

function parseFullName(full: string): { first: string; last: string } {
  const parts = (full || '').trim().split(/\s+/)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

export default function ProfilePage() {
  const { user, profile, companyId, refreshProfile, loading: authLoading } = useAuth()
  const isBusinessOwner = profile?.role === 'business_owner' && !!companyId
  type TabId = 'personal' | 'orders' | OwnerTabId
  const [activeTab, setActiveTab] = useState<TabId>('personal')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { showSuccess, showError } = useToast()

  const tabs = (
    [
      { id: 'personal' as const, label: 'Personal', icon: <UserCircle className="w-4 h-4" />, show: true },
      { id: 'orders' as const, label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, show: !isBusinessOwner },
      { id: 'business' as const, label: 'Business', icon: <Building2 className="w-4 h-4" />, show: isBusinessOwner },
      { id: 'site' as const, label: 'Site Settings', icon: <Globe className="w-4 h-4" />, show: isBusinessOwner },
      { id: 'integrations' as const, label: 'Integrations', icon: <Zap className="w-4 h-4" />, show: isBusinessOwner },
    ] satisfies { id: TabId; label: string; icon: React.ReactNode; show: boolean }[]
  ).filter((t) => t.show)

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
    social_links: { twitter: '', linkedin: '', instagram: '', website: '' } as Record<string, string>,
    preferences: { newsletter: false, order_updates: false } as Record<string, boolean>,
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (activeTab === 'orders' && isBusinessOwner) {
      setActiveTab('personal')
    }
  }, [isBusinessOwner, activeTab])

  useEffect(() => {
    if (user && !profile) {
      refreshProfile()
    }
  }, [user, profile, refreshProfile])

  useEffect(() => {
    if (user) {
      const fullName = profile?.full_name || (user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : user?.first_name || user?.last_name || '')
      const { first, last } = parseFullName(fullName)
      const social = profile?.social_links || {}
      const prefs = profile?.preferences || {}
      setFormData({
        email: (profile?.pending_email || profile?.email || user?.email || '') as string,
        first_name: profile?.first_name || first,
        last_name: profile?.last_name || last,
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
        social_links: {
          twitter: social.twitter || '',
          linkedin: social.linkedin || '',
          instagram: social.instagram || '',
          website: social.website || '',
        },
        preferences: {
          newsletter: !!prefs.newsletter,
          order_updates: !!prefs.order_updates,
        },
      })
      fetchOrders()
    }
  }, [profile, user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response: unknown = await ecommerceApi.orders.list()
      const orderData = Array.isArray(response)
        ? response
        : ((response as { results?: Order[] })?.results || [])
      setOrders(orderData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ')
      const prevLoginEmail = (profile?.email || '').trim().toLowerCase()
      const typedEmail = formData.email.trim().toLowerCase()
      const updated = (await newsApi.profile.patch({
        full_name: fullName || undefined,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        avatar_url: formData.avatar_url || undefined,
        social_links: formData.social_links,
        preferences: formData.preferences,
      })) as { pending_email?: string }
      await refreshProfile()
      if (typedEmail !== prevLoginEmail && updated?.pending_email) {
        showSuccess('Check your inbox to confirm your new email. Login still uses your current address until then.')
      } else {
        showSuccess('Profile updated successfully')
      }
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to update profile'))
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }
    setUploadingAvatar(true)
    try {
      const uploaded = (await newsApi.media.upload(file, { media_type: 'image' })) as { file_url?: string }
      const url = uploaded?.file_url
      if (url) {
        const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ')
        setFormData((f) => ({ ...f, avatar_url: url }))
        await newsApi.profile.patch({
          full_name: fullName || undefined,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          email: formData.email.trim(),
          phone: formData.phone || undefined,
          bio: formData.bio || undefined,
          avatar_url: url,
          social_links: formData.social_links,
          preferences: formData.preferences,
        })
        await refreshProfile()
        showSuccess('Profile picture updated')
      }
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to upload profile picture'))
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-forest-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-forest-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-forest-background flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold font-playfair">Please Sign In</h1>
          <p className="text-text-muted">You need to be logged in to view your profile and orders.</p>
          <Link href="/login" className="btn btn-primary w-full py-3">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const displayName =
    [formData.first_name, formData.last_name].filter(Boolean).join(' ') ||
    profile?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <div className="min-h-screen bg-forest-background py-12">
      <div className="container-wide">
        <div className="flex items-center gap-4 mb-8">
          <label className="relative cursor-pointer group">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-forest-primary/10 flex items-center justify-center text-forest-primary font-bold text-xl border-2 border-transparent group-hover:border-forest-primary/50 transition-colors">
              {(formData.avatar_url || profile?.avatar_url) ? (
                <img src={formData.avatar_url || profile?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-text-inverse" />
              </div>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          </label>
          <div>
            <h1 className="text-xl font-bold font-playfair text-text">{displayName}</h1>
            <p className="text-sm text-text-muted">{formData.email || user.email}</p>
            <p className="text-xs text-text-muted mt-0.5">Click photo to upload</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                (activeTab === tab.id
                  ? 'border-forest-primary text-forest-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-border')
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'personal' && (
            <div className="card p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="profile-form-grid">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="form-input"
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="form-input"
                      placeholder="Last name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Cellphone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="+27 82 123 4567"
                      required
                    />
                    <p className="text-xs text-text-muted">Required for delivery</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Account email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="you@example.com"
                      required
                    />
                    <p className="text-xs text-text-muted">Login and notifications — separate from storefront business email</p>
                    {profile?.pending_email ? (
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                        A confirmation link was sent to <strong>{profile.pending_email}</strong>.
                        Your login email stays <strong>{profile.email}</strong> until you confirm.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="form-input min-h-[100px] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="profile-section-divider">
                  <h3 className="profile-section-subtitle">Social Links</h3>
                  <div className="profile-form-grid">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Twitter / X</label>
                      <input
                        type="url"
                        value={formData.social_links.twitter}
                        onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                        className="form-input"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-muted">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.social_links.linkedin}
                        onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                        className="form-input"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Instagram</label>
                      <input
                        type="url"
                        value={formData.social_links.instagram}
                        onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                        className="form-input"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Website</label>
                      <input
                        type="url"
                        value={formData.social_links.website}
                        onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })}
                        className="form-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                <div className="profile-section-divider">
                  <h3 className="profile-section-subtitle">Preferences</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.newsletter}
                        onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, newsletter: e.target.checked } })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-text">Newsletter – receive updates and offers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.order_updates}
                        onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, order_updates: e.target.checked } })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-text">Order updates – emails about order progress</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-light">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && !isBusinessOwner && (
            <div className="card p-6">
              <h2 className="text-xl font-bold font-playfair text-text mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-forest-primary" />
                Order History
              </h2>

              {loadingOrders ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-forest-primary opacity-50" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-xl p-4 hover:border-forest-primary/30 transition-all group">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-forest-primary uppercase tracking-widest">Order #{order.order_number}</p>
                          <p className="text-sm text-text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs font-bold uppercase text-text-muted">Total</p>
                            <p className="font-bold text-text">R{Number(order.total).toFixed(2)}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-forest-primary/10 text-forest-primary'
                          }`}>
                            {order.status}
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-forest-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto text-text-muted">
                    <Package className="w-8 h-8" />
                  </div>
                  <p className="text-text-muted">You haven&apos;t placed any orders yet.</p>
                  <Link href="/products" className="btn btn-secondary btn-sm">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {isBusinessOwner && (activeTab === 'business' || activeTab === 'site' || activeTab === 'integrations') && companyId ? (
            <ProfileOwnerTabs activeTab={activeTab} companyId={companyId} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
