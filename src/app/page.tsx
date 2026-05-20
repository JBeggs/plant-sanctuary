import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
import { getCompany } from '@/lib/company'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Leaf, Home, Sprout } from 'lucide-react'
import PageHero from '@/components/hero/PageHero'
import DefaultHomeHero from '@/components/home/DefaultHomeHero'

async function getHomeData() {
  try {
    /**
     * One bad fetch should NOT zero every shelf.
     * `Promise.allSettled` lets each shelf fail independently; the rest still render.
     */
    const settled = await Promise.allSettled([
      serverEcommerceApi.products.list({ is_active: true }),
      serverEcommerceApi.products.list({ is_active: true, tags: 'indoor', exclude_featured: true, page_size: 20 }),
      serverEcommerceApi.products.list({ is_active: true, tags: 'succulents', exclude_featured: true, page_size: 20 }),
      serverNewsApi.articles.list({ status: 'published' }),
    ])

    const SHELF_LABELS = ['products', 'indoor', 'succulents', 'articles'] as const
    const failures = settled
      .map((s, i) =>
        s.status === 'rejected'
          ? { shelf: SHELF_LABELS[i], reason: (s as PromiseRejectedResult).reason }
          : null,
      )
      .filter(Boolean)
    if (failures.length) {
      console.error('[home] some SSR fetches failed; rendering remaining shelves', failures)
    }

    const valueOrEmpty = (i: number): unknown =>
      settled[i].status === 'fulfilled'
        ? (settled[i] as PromiseFulfilledResult<unknown>).value
        : []

    const [productsData, indoorData, succulentsData, articlesData] = settled.map((_, i) =>
      valueOrEmpty(i),
    )

    const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || (productsData as any)?.results || []
    const indoorProducts = Array.isArray(indoorData) ? indoorData : (indoorData as any)?.data || (indoorData as any)?.results || []
    const succulentsProducts = Array.isArray(succulentsData) ? succulentsData : (succulentsData as any)?.data || (succulentsData as any)?.results || []
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.data || (articlesData as any)?.results || []

    return {
      featuredProducts: products.filter((p: Product) => p.featured).slice(0, 8),
      allProducts: products.slice(0, 8),
      indoorProducts: indoorProducts.filter((p: Product) => p.status !== 'archived').slice(0, 6),
      succulentsProducts: succulentsProducts.filter((p: Product) => p.status !== 'archived').slice(0, 6),
      latestArticles: articles.slice(0, 3),
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredProducts: [],
      allProducts: [],
      indoorProducts: [],
      succulentsProducts: [],
      latestArticles: [],
    }
  }
}

export default async function HomePage() {
  const [company, homeData] = await Promise.all([getCompany(), getHomeData()])
  const { featuredProducts, allProducts, indoorProducts, succulentsProducts, latestArticles } = homeData
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts

  return (
    <div className="min-h-screen">
      <PageHero pageSlug="home" fallback={<DefaultHomeHero company={company} />} />

      {/* Featured Plants Section */}
      {displayProducts.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Plants</h2>
                <p className="text-text-muted mt-1">Our most loved and easy-care varieties</p>
              </div>
              <Link href="/products" className="btn btn-secondary">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="product-grid">
              {displayProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group relative flex flex-col product-card-forest">
                  <div className="relative overflow-hidden aspect-square">
                    {product.featured_image?.file_url || product.image ? (
                      <img
                        src={product.featured_image?.file_url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-forest-background flex items-center justify-center">
                        <Leaf className="w-12 h-12 text-forest-primary/30" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="tag tag-featured absolute top-2 right-2 shadow-sm">Featured</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-text group-hover:text-forest-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2 flex-1">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                      <span className="price">R{Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                        <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Indoor Plants Section */}
      {indoorProducts.length > 0 && (
        <section className="py-16 bg-forest-background">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Indoor Plants</h2>
                <p className="text-text-muted mt-1">Perfect for your home or office</p>
              </div>
              <Link href="/products?tags=indoor" className="btn btn-primary">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="product-grid">
              {indoorProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group relative flex flex-col product-card-forest">
                  <div className="relative overflow-hidden aspect-square">
                    {product.featured_image?.file_url || product.image ? (
                      <img
                        src={product.featured_image?.file_url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-forest-background flex items-center justify-center">
                        <Home className="w-12 h-12 text-forest-primary/30" />
                      </div>
                    )}
                    <span className="tag tag-featured absolute top-2 left-2">Indoor</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-text group-hover:text-forest-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2 flex-1">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                      <span className="price">R{Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Succulents Section */}
      {succulentsProducts.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Succulents</h2>
                <p className="text-text-muted mt-1">Low-maintenance and drought-tolerant</p>
              </div>
              <Link href="/products?tags=succulents" className="btn btn-secondary">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="product-grid">
              {succulentsProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group relative flex flex-col product-card-forest">
                  <div className="relative overflow-hidden aspect-square">
                    {product.featured_image?.file_url || product.image ? (
                      <img
                        src={product.featured_image?.file_url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-forest-background flex items-center justify-center">
                        <Sprout className="w-12 h-12 text-forest-primary/30" />
                      </div>
                    )}
                    <span className="tag absolute top-2 left-2 bg-forest-accent/90 text-text-inverse">Succulents</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-text group-hover:text-forest-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2 flex-1">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                      <span className="price">R{Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Care Guides Section */}
      {latestArticles.length > 0 && (
        <section className="py-16 bg-forest-background">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Care Guides</h2>
                <p className="text-text-muted mt-1">Expert tips for keeping your plants happy</p>
              </div>
              <Link href="/articles" className="btn btn-primary">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="article-grid">
              {latestArticles.map((article: Article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="card group">
                  {article.featured_media?.file_url && (
                    <img
                      src={article.featured_media.file_url}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-forest-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-text-muted mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="mt-3 text-sm text-text-muted">
                      {article.published_at && new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state if no products */}
      {displayProducts.length === 0 && (
        <section className="py-16 bg-forest-background">
          <div className="container-wide text-center">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-forest-primary/30" />
            <h2 className="section-title mb-2">Plants Coming Soon</h2>
            <p className="text-text-muted mb-6">We&apos;re preparing our collection. Check back soon!</p>
            <Link href="/contact" className="btn btn-primary">Get Notified</Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-band to-brand-band-dark text-on-brand">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-on-brand-muted mb-8 max-w-2xl mx-auto">
            Be the first to know about new arrivals, care tips, and exclusive offers.
          </p>
          <Link href="/register" className="btn bg-forest-accent hover:bg-forest-accent-dark text-lg px-8 py-3">
            Create an Account
          </Link>
        </div>
      </section>
    </div>
  )
}
