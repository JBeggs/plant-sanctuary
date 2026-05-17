import Link from 'next/link'
import { serverEcommerceApi } from '@/lib/api-server'
import { Product } from '@/lib/types'
import { Leaf, Filter, Search } from 'lucide-react'
import AdminActions from '@/components/products/AdminActions'
import ProductCard from '@/components/products/ProductCard'

interface ApiCategory {
  id: string
  name: string
  slug: string
  description?: string
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string; tags?: string }>
}

async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await serverEcommerceApi.categories.list()
    const data = (res as { success?: boolean; data?: ApiCategory[] })?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getProducts(params: { category?: string; search?: string; page?: string; tags?: string }) {
  try {
    const apiParams: Record<string, string | number | boolean | undefined> = {
      is_active: true,
      category: params.category,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    }
    if (params.tags) apiParams.tags = params.tags
    const productsData = await serverEcommerceApi.products.list(apiParams)

    const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || (productsData as any)?.results || []
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

const TAG_LABELS: Record<string, string> = { indoor: 'Indoor', succulents: 'Succulents' }

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([getProducts(params), getCategories()])
  const selectedCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : null
  const selectedTag = params.tags || null

  return (
    <div className="min-h-screen bg-forest-background">
      {/* Admin Management Actions */}
      <AdminActions />

      {/* Page Header */}
      <section className="py-12 bg-gradient-to-r from-forest-primary to-forest-primary text-white">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            {selectedTag ? TAG_LABELS[selectedTag] || selectedTag : selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          <p className="text-lg opacity-90">
            {selectedTag
              ? `Browse our ${TAG_LABELS[selectedTag] || selectedTag} collection`
              : selectedCategory
                ? selectedCategory.description || `Browse our ${selectedCategory.name.toLowerCase()} collection`
                : 'Browse our complete collection by category'}
          </p>
        </div>
      </section>

      {/* Category & Tag Filters */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container-wide">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-muted" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory && !selectedTag ? 'bg-forest-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                All
              </Link>
              <Link
                href="/products?tags=indoor"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === 'indoor' ? 'bg-forest-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                Indoor
              </Link>
              <Link
                href="/products?tags=succulents"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === 'succulents' ? 'bg-forest-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                Succulents
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory?.slug === cat.slug ? 'bg-forest-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Leaf className="w-4 h-4 inline mr-1" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12" data-cy="products-section">
        <div className="container-wide">
          {products.length > 0 ? (
            <div className="product-grid" data-cy="products-grid">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" data-cy="products-empty">
              <Search className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-30" />
              <h2 className="text-xl font-semibold text-text mb-2">No products found</h2>
              <p className="text-text-muted mb-6">
                {params.search
                  ? `No results for "${params.search}"`
                  : selectedTag
                    ? `No ${TAG_LABELS[selectedTag] || selectedTag} products yet. Check back soon!`
                    : selectedCategory
                      ? `No products in ${selectedCategory.name} yet. Check back soon!`
                      : 'Check back soon for new items!'}
              </p>
              <Link href="/products" className="btn btn-primary">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
