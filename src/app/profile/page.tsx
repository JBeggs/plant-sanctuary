'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ecommerceApi, newsApi, getApiErrorMessage } from '@/lib/api'
import { Order, Profile } from '@/lib/types'
import { useToast } from '@/contexts/ToastContext'
import {
  Package,
  User,
  Mail,
  Calendar,
  ChevronRight,
  Loader2,
  Save,
  Building2,
  Settings,
  UserCircle,
  ShoppingBag,
  Globe,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import ProfileOwnerTabs from './ProfileOwnerTabs'

type OwnerTabId = 'business' | 'site' | 'integrations'

export default function ProfilePage() {
  const { user, profile, companyId, refreshProfile, loading: authLoading } = useAuth()
  const isBusinessOwner = profile?.role === 'business_owner' && !!companyId
  type TabId = 'personal' | 'orders' | OwnerTabId
  const [activeTab, setActiveTab] = useState<TabId>(isBusinessOwner ? 'business' : 'personal')
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
    full_name: '',
    bio: '',
    avatar_url: '',
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (activeTab === 'orders' && isBusinessOwner) {
      setActiveTab('business')
    }
  }, [isBusinessOwner, activeTab])

  useEffect(() => {
    if (user) {
      // Customers have no profile; fall back to user data
      const fullName = profile?.full_name || (user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : user?.first_name || user?.last_name || '')
      setFormData({
        full_name: fullName,
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
      })
      fetchOrders()
    }
  }, [profile, user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response: any = await ecommerceApi.orders.list()
      const orderData = Array.isArray(response) ? response : (response?.results || [])
      setOrders(orderData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return // Customers have no News Profile; patch would 404
    setUpdating(true)
    try {
      await newsApi.profile.patch({ full_name: formData.full_name, bio: formData.bio, avatar_url: formData.avatar_url })
      await refreshProfile()
      showSuccess('Profile updated successfully')
    } catch (error: any) {
      showError(getApiErrorMessage(error, 'Failed to update profile'))
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return // Customers have no News Profile; patch would 404
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }
    setUploadingAvatar(true)
    try {
      const uploaded: any = await newsApi.media.upload(file, { media_type: 'image' })
      const url = uploaded?.file_url
      if (url) {
        setFormData((f) => ({ ...f, avatar_url: url }))
        await newsApi.profile.patch({ full_name: formData.full_name, bio: formData.bio, avatar_url: url })
        await refreshProfile()
        showSuccess('Profile picture updated')
      }
    } catch (error: any) {
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

  return (
    <div className="min-h-screen bg-forest-background py-12">
      <div className="container-wide">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ' +
                (activeTab === tab.id
                  ? 'bg-forest-primary text-white'
                  : 'bg-surface text-text-muted hover:text-forest-primary border border-border')
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-forest-primary/10 flex items-center justify-center text-forest-primary font-bold text-2xl border-2 border-transparent group-hover:border-forest-primary/50 transition-colors">
                    {(formData.avatar_url || profile?.avatar_url) ? (
                      <img src={formData.avatar_url || profile?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (formData.full_name || profile?.full_name || user.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={uploadingAvatar || !profile} />
                </label>
                <div>
                  <h1 className="text-xl font-bold text-text">{formData.full_name || profile?.full_name || user.email?.split('@')[0] || 'User'}</h1>
                  <p className="text-sm text-text-muted">{user.email}</p>
                  <p className="text-xs text-text-muted mt-1">{profile ? 'Click photo to upload' : 'Profile photo is for publishers only'}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="form-input"
                    placeholder="Your Name"
                  />
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
                <button
                  type="submit"
                  disabled={updating || !profile}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  title={!profile ? 'Profile updates are for publishers only' : undefined}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-light">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-light">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isBusinessOwner && (activeTab === 'business' || activeTab === 'site' || activeTab === 'integrations') && companyId ? (
              <ProfileOwnerTabs activeTab={activeTab} companyId={companyId} />
            ) : null}

            {(!isBusinessOwner || activeTab === 'orders') && (
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
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-forest-primary/30 transition-all group">
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
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-forest-primary transition-colors" />
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
                  <p className="text-text-muted">You haven't placed any orders yet.</p>
                  <Link href="/products" className="btn btn-secondary btn-sm">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
