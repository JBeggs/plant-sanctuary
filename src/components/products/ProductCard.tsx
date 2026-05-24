'use client'

import Link from 'next/link'
import { Product } from '@/lib/types'
import { Leaf, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ecommerceApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import { getProductCardImages, IMAGE_DIM } from '@/lib/image-utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { profile } = useAuth()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'
  const categoryName = typeof product.category === 'object' && product.category ? (product.category as any).name : null
  const cardImages = getProductCardImages(product)
  const cardImage = cardImages[0]

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    try {
      await ecommerceApi.products.delete(product.id)
      showSuccess('Product deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Failed to delete product')
    }
  }

  return (
    <div className="h-full" data-cy="product-card">
      <div className="product-card-forest group relative h-full flex flex-col">
        <div className="relative overflow-hidden aspect-square">
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-0"
          >
            {cardImage && cardImage !== '/images/products/default.svg' ? (
              <img
                src={cardImage}
                alt={product.name}
                width={IMAGE_DIM.productCard.width}
                height={IMAGE_DIM.productCard.height}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-forest-background flex items-center justify-center">
                <Leaf className="w-12 h-12 text-forest-primary/30" />
              </div>
            )}
          </Link>
          
          {categoryName && (
            <span className="tag tag-plant absolute top-2 left-2 z-10 pointer-events-none">
              {categoryName}
            </span>
          )}
          
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="tag tag-sale absolute top-2 right-2 z-10 pointer-events-none">Sale</span>
          )}

          {product.featured && (
            <span className="tag tag-featured absolute top-10 right-2 z-10 pointer-events-none shadow-sm">Featured</span>
          )}

          {/* Admin Actions Overlay */}
          {isAuthorized && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
              <Link
                href={`/admin/inventory/edit/${product.id}`}
                className="btn-hero-chip p-2 rounded-full hover:bg-forest-primary hover:text-text-inverse transition-all shadow-lg"
                title="Edit Product"
              >
                <Edit2 className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="btn-hero-chip p-2 rounded-full text-forest-accent hover:bg-forest-accent hover:text-text-inverse transition-all shadow-lg"
                title="Delete Product"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <Link href={`/products/${product.slug}`} className="group/title">
            <h3
              className="font-semibold text-text group-hover:text-forest-primary transition-colors line-clamp-2 leading-snug min-h-[2.75rem]"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
          {(product.short_description || product.description) && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2 min-h-[2.5rem]">
              {product.short_description || product.description}
            </p>
          )}
          <div className="mt-auto pt-3 flex items-center gap-2">
            <span className="price">
              R{Number(product.price).toFixed(2)}
            </span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
            )}
          </div>
          {product.quantity <= 5 && product.quantity > 0 && (
            <p className="text-sm text-forest-accent mt-2 font-medium">Only {product.quantity} left!</p>
          )}
          {product.quantity === 0 && (
            <p className="text-sm text-text-muted mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </div>
  )
}
