'use client'

import { useState } from 'react'
import { Product } from '@/lib/types'
import { Clock, Sparkles } from 'lucide-react'
import {
  getProductBundleImages,
  getProductGalleryThumbImages,
  getPublicImageUrl,
  IMAGE_DIM,
} from '@/lib/image-utils'

interface ProductGalleryProps {
  product: Product
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const fullImages = getProductBundleImages(product)
  const thumbImages = getProductGalleryThumbImages(fullImages, product)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeFull = fullImages[activeIndex] ?? fullImages[0] ?? ''
  const activeImage = activeFull ? getPublicImageUrl(activeFull) : ''
  const isVintage = Array.isArray(product.tags) && product.tags.some(t => (typeof t === 'string' ? t : t.name) === 'vintage')

  if (fullImages.length === 0) {
    return (
      <div className="w-full h-96 bg-surface-raised rounded-2xl flex items-center justify-center border border-border">
        {isVintage ? (
          <Clock className="w-24 h-24 text-forest-primary/20" />
        ) : (
          <Sparkles className="w-24 h-24 text-forest-primary/20" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border shadow-sm group">
        <img
          src={activeImage}
          alt={product.name}
          width={IMAGE_DIM.galleryMain.width}
          height={IMAGE_DIM.galleryMain.height}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/default.svg' }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`tag ${isVintage ? 'tag-vintage' : 'tag-new'} shadow-md`}>
            {isVintage ? 'Vintage' : 'New'}
          </span>
          {product.featured && (
            <span className="tag tag-featured shadow-md">Featured</span>
          )}
        </div>
      </div>

      {fullImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {fullImages.map((full, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === index
                  ? 'border-forest-primary shadow-md scale-95'
                  : 'border-transparent hover:border-border opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={thumbImages[index] ? getPublicImageUrl(thumbImages[index]) : getPublicImageUrl(full)}
                alt={`${product.name} thumbnail ${index + 1}`}
                width={IMAGE_DIM.galleryThumb.width}
                height={IMAGE_DIM.galleryThumb.height}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/default.svg' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
