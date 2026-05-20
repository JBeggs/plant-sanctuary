'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ecommerceApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  ArrowLeft,
  Package,
  Truck,
  Loader2,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'

interface OrderItem {
  id: string
  product_id?: string
  product_name: string
  product_image: string
  product_sku?: string
  price: number
  quantity: number
  subtotal: number
  cancelled?: boolean
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  delivery_method: string
  waybill_number?: string
  tracking_number?: string
  collection_code?: string
  created_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  customer_email?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_phone?: string
  shipping_address?: Record<string, string>
  pudo_pickup_point?: Record<string, unknown>
  items: OrderItem[]
}

const deliveryMethodLabel: Record<string, string> = {
  standard: 'Standard',
  express: 'Express',
  pudo: 'Pudo Pickup',
  collect: 'Collect In-Store',
  'same-day': 'Same Day',
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    shipped: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    paid: 'bg-forest-primary/10 text-forest-primary',
    pending: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { profile, loading: authLoading } = useAuth()
  const { showSuccess, showError } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingShipment, setCreatingShipment] = useState(false)

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response: unknown = await ecommerceApi.orders.get(id)
      const data = (response as { data?: Order })?.data || (response as Order)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      showError('Failed to load order')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/login')
      return
    }
    if (isAuthorized && id) {
      fetchOrder()
    }
  }, [isAuthorized, authLoading, id])

  const handleCreateShipment = async () => {
    setCreatingShipment(true)
    try {
      await ecommerceApi.orders.createShipment(id)
      showSuccess('Shipment created successfully')
      fetchOrder()
    } catch (error: unknown) {
      const err = error as { details?: { error?: { message?: string } }; message?: string }
      const msg = err?.details?.error?.message || err?.message || 'Failed to create shipment'
      showError(msg)
    } finally {
      setCreatingShipment(false)
    }
  }

  const canCreateShipment = order &&
    (order.status === 'paid' || order.status === 'processing') &&
    !order.waybill_number &&
    !order.tracking_number

  const addr = order?.shipping_address || {}

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-forest-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-forest-primary opacity-50" />
      </div>
    )
  }

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-forest-background flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-forest-primary mb-4" />
        <p className="font-bold text-text uppercase tracking-widest text-xs">Loading order...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-background pb-20">
      {/* Header */}
      <div className="admin-shell-bar sticky top-0 z-30">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/orders" className="p-2 hover:bg-surface-raised rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-text-light" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-playfair text-text">
                  Order #{order.order_number}
                </h1>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Store Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(order.status)}
              {getStatusBadge(order.payment_status)}
              {canCreateShipment && (
                <button
                  onClick={handleCreateShipment}
                  disabled={creatingShipment}
                  className="min-h-[44px] px-4 py-2 btn btn-primary flex items-center gap-2"
                >
                  {creatingShipment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Create Shipment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8 space-y-6">
        {/* Customer & Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-panel p-6">
            <h2 className="font-bold text-text mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Customer
            </h2>
            <p className="font-medium text-text">
              {order.customer_first_name} {order.customer_last_name}
            </p>
            <p className="text-sm text-text-muted">{order.customer_email}</p>
            {order.customer_phone && (
              <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {order.customer_phone}
              </p>
            )}
          </div>
          <div className="admin-panel p-6">
            <h2 className="font-bold text-text mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping
            </h2>
            <p className="text-sm text-text">
              {deliveryMethodLabel[order.delivery_method] || order.delivery_method}
            </p>
            {addr.address && (
              <p className="text-sm text-text-muted mt-1">
                {[addr.address, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ')}
              </p>
            )}
            {order.waybill_number && (
              <p className="text-sm font-mono mt-2">Waybill: {order.waybill_number}</p>
            )}
            {order.tracking_number && (
              <p className="text-sm font-mono">Tracking: {order.tracking_number}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="admin-panel overflow-hidden">
          <h2 className="font-bold text-text p-6 pb-0">Order Items</h2>
          <div className="p-6 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  item.cancelled ? 'bg-surface-raised border-border opacity-60' : 'bg-surface border-border'
                }`}
              >
                <div className="w-16 h-16 bg-surface-raised rounded-lg overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text">{item.product_name}</p>
                  {item.product_sku && (
                    <p className="text-xs text-text-muted font-mono">{item.product_sku}</p>
                  )}
                  <p className="text-sm text-text-muted">
                    R{Number(item.price).toFixed(2)} × {item.quantity} = R{Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
                {item.cancelled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                    Cancelled
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="admin-panel p-6 max-w-md ml-auto">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-medium text-text">R{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Shipping</span>
              <span className="font-medium text-text">R{Number(order.shipping).toFixed(2)}</span>
            </div>
            {Number(order.tax) > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Tax</span>
                <span className="font-medium text-text">R{Number(order.tax).toFixed(2)}</span>
              </div>
            )}
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Discount</span>
                <span className="font-medium text-forest-accent">-R{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-bold text-text">Total</span>
              <span className="font-bold text-text text-lg">R{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
