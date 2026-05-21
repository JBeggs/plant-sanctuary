/**
 * Unit tests for ProductCard component
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

/** Inline image avoids jsdom network fetches that can exceed the 5s test timeout */
const TEST_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const mockGetProductCardImages = vi.fn((): string[] => []);

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
vi.mock('@/lib/image-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/image-utils')>();
  return {
    ...actual,
    getProductCardImages: (
      ...args: Parameters<typeof actual.getProductCardImages>
    ) => mockGetProductCardImages(...args),
  };
});

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

async function renderProductCard(product: Product) {
  await act(async () => {
    render(<ProductCard product={product} />);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProductCardImages.mockReturnValue([]);
  });

  it('renders product name and price', async () => {
    await renderProductCard(baseProduct);
    expect(screen.getByText('Test Plant')).toBeInTheDocument();
    expect(screen.getByText('R49.99')).toBeInTheDocument();
  });

  it('renders product image when provided', async () => {
    mockGetProductCardImages.mockReturnValue([TEST_IMAGE]);
    const product = { ...baseProduct, image: TEST_IMAGE };
    await renderProductCard(product);
    const img = screen.getByAltText('Test Plant');
    expect(img).toHaveAttribute('src', TEST_IMAGE);
  });

  it('renders product image from featured_image when provided', async () => {
    mockGetProductCardImages.mockReturnValue([TEST_IMAGE]);
    const product = {
      ...baseProduct,
      featured_image: { file_url: TEST_IMAGE } as Product['featured_image'],
    };
    await renderProductCard(product);
    const img = screen.getByAltText('Test Plant');
    expect(img).toHaveAttribute('src', TEST_IMAGE);
  });

  it('shows category tag when product has category', async () => {
    const product = {
      ...baseProduct,
      category: { id: '1', name: 'Succulents', slug: 'succulents' } as Product['category'],
    };
    await renderProductCard(product);
    expect(screen.getByText('Succulents')).toBeInTheDocument();
  });

  it('shows Sale tag when compare_at_price is greater than price', async () => {
    const product = {
      ...baseProduct,
      price: 39.99,
      compare_at_price: 49.99,
    };
    await renderProductCard(product);
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('does not show Sale tag when compare_at_price is less than or equal to price', async () => {
    const product = {
      ...baseProduct,
      price: 49.99,
      compare_at_price: 49.99,
    };
    await renderProductCard(product);
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
  });

  it('shows Featured tag when product is featured', async () => {
    const product = { ...baseProduct, featured: true };
    await renderProductCard(product);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders description when provided', async () => {
    const product = { ...baseProduct, description: 'A beautiful houseplant' };
    await renderProductCard(product);
    expect(screen.getByText('A beautiful houseplant')).toBeInTheDocument();
  });

  it('shows "Only X left!" when quantity is low', async () => {
    const product = { ...baseProduct, quantity: 3 };
    await renderProductCard(product);
    expect(screen.getByText('Only 3 left!')).toBeInTheDocument();
  });

  it('shows "Out of stock" when quantity is 0', async () => {
    const product = { ...baseProduct, quantity: 0 };
    await renderProductCard(product);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('has data-cy product-card attribute', async () => {
    await renderProductCard(baseProduct);
    const card = document.querySelector('[data-cy="product-card"]');
    expect(card).toBeInTheDocument();
  });
});
