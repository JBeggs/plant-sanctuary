'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ecommerceApi, newsApi } from '@/lib/api'
import { Order, Profile } from '@/lib/types'
import { useToast } from '@/contexts/ToastContext'
import { Package, User, Mail, Calendar, MapPin, ChevronRight, Loader2, Save, Phone, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, companyId, refreshProfile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [company, setCompany] = useState<{ id: string; name: string; email: string; phone?: string; logo?: string } | null>(null)
  const [companyForm, setCompanyForm] = useState({ logo: '', phone: '' })
  const [updatingCompany, setUpdatingCompany] = useState(false)
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      })
      fetchOrders()
    }
  }, [profile])

  useEffect(() => {
    if (companyId) {
      ecommerceApi.companies.get(companyId).then((c: any) => {
        setCompany(c)
        setCompanyForm({ logo: c?.logo || '', phone: c?.phone || '' })
      }).catch(() => {})
    }
  }, [companyId])

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
    setUpdating(true)
    try {
      await newsApi.profile.patch(formData)
      await refreshProfile()
      showSuccess('Profile updated successfully')
    } catch (error: any) {
      showError(error.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setUpdatingCompany(true)
    try {
      const updated = await ecommerceApi.companies.update(companyId, {
        logo: companyForm.logo || null,
        phone: companyForm.phone || '',
      })
      setCompany(updated)
      showSuccess('Business profile updated')
    } catch (error: any) {
      showError(error.message || 'Failed to update business profile')
    } finally {
      setUpdatingCompany(false)
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-forest-primary/10 rounded-full flex items-center justify-center text-forest-primary font-bold text-2xl">
                  {profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text">{profile?.full_name || 'User'}</h1>
                  <p className="text-sm text-text-muted">{user.email}</p>
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
                  disabled={updating}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
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
                  <span>Joined {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>

              {companyId && company && (
                <>
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Business Profile
                    </h3>
                    <form onSubmit={handleUpdateCompany} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Logo (URL)</label>
                        <input
                          type="url"
                          value={companyForm.logo}
                          onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                          className="form-input"
                          placeholder="https://example.com/logo.png"
                        />
                        {companyForm.logo && (
                          <div className="mt-2">
                            <img src={companyForm.logo} alt="Logo preview" className="w-12 h-12 rounded object-contain" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Phone</label>
                        <input
                          type="tel"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          className="form-input"
                          placeholder="+27 11 123 4567"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingCompany}
                        className="btn btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        {updatingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Business Profile
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content: Orders */}
          <div className="lg:col-span-2 space-y-6">
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
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                    <Package className="w-8 h-8" />
                  </div>
                  <p className="text-text-muted">You haven't placed any orders yet.</p>
                  <Link href="/products" className="btn btn-secondary btn-sm">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
