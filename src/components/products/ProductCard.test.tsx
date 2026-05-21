/**
 * Unit tests for ProductCard component
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/** Inline image avoids jsdom network fetches that can exceed the 5s test timeout */
const TEST_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ profile: { role: 'user' } }),
}));
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode;
    href?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('@/lib/api', () => ({
  ecommerceApi: { products: { delete: vi.fn() } },
}));
vi.mock('@/lib/image-utils', () => ({
  getProductCardImages: (product: {
    image?: string
    featured_image?: { file_url?: string; thumbnail_url?: string }
    image_thumbnail?: string
    image_thumbnails?: string[]
  }) => {
    const thumbs = Array.isArray(product.image_thumbnails)
      ? product.image_thumbnails.filter(Boolean)
      : []
    if (thumbs.length > 0) return thumbs
    if (product.image_thumbnail?.trim()) return [product.image_thumbnail.trim()]
    if (product.featured_image?.thumbnail_url?.trim()) {
      return [product.featured_image.thumbnail_url.trim()]
    }
    if (product.featured_image?.file_url?.trim()) {
      return [product.featured_image.file_url.trim()]
    }
    if (product.image?.trim()) return [product.image.trim()]
    return ['/images/products/default.svg']
  },
}));

const baseProduct: Product = {
  id: 'prod-1',
  name: 'Test Plant',
  slug: 'test-plant',
  price: 49.99,
  quantity: 10,
  track_inventory: true,
  allow_backorder: false,
  is_active: true,
  featured: false,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  stock_quantity: 10,
  in_stock: true,
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product name and price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Test Plant')).toBeInTheDocument();
    expect(screen.getByText('R49.99')).toBeInTheDocument();
  });

  it('renders product image when provided', () => {
    const product = { ...baseProduct, image: TEST_IMAGE };
    render(<ProductCard product={product} />);
    const img = screen.getByAltText('Test Plant');
    expect(img).toHaveAttribute('src', TEST_IMAGE);
  });

  it('renders product image from featured_image when provided', () => {
    const product = {
      ...baseProduct,
      featured_image: { file_url: TEST_IMAGE } as any,
    };
    render(<ProductCard product={product} />);
    const img = screen.getByAltText('Test Plant');
    expect(img).toHaveAttribute('src', TEST_IMAGE);
  });

  it('shows category tag when product has category', () => {
    const product = {
      ...baseProduct,
      category: { id: '1', name: 'Succulents', slug: 'succulents' } as any,
    };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Succulents')).toBeInTheDocument();
  });

  it('shows Sale tag when compare_at_price is greater than price', () => {
    const product = {
      ...baseProduct,
      price: 39.99,
      compare_at_price: 49.99,
    };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('does not show Sale tag when compare_at_price is less than or equal to price', () => {
    const product = {
      ...baseProduct,
      price: 49.99,
      compare_at_price: 49.99,
    };
    render(<ProductCard product={product} />);
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
  });

  it('shows Featured tag when product is featured', () => {
    const product = { ...baseProduct, featured: true };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const product = { ...baseProduct, description: 'A beautiful houseplant' };
    render(<ProductCard product={product} />);
    expect(screen.getByText('A beautiful houseplant')).toBeInTheDocument();
  });

  it('shows "Only X left!" when quantity is low', () => {
    const product = { ...baseProduct, quantity: 3 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Only 3 left!')).toBeInTheDocument();
  });

  it('shows "Out of stock" when quantity is 0', () => {
    const product = { ...baseProduct, quantity: 0 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('has data-cy product-card attribute', () => {
    render(<ProductCard product={baseProduct} />);
    const card = document.querySelector('[data-cy="product-card"]');
    expect(card).toBeInTheDocument();
  });
});
