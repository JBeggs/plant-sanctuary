import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Leaf, BookOpen } from 'lucide-react'

async function getHomeData() {
  try {
    const [productsData, articlesData] = await Promise.all([
      serverEcommerceApi.products.list({ is_active: true }),
      serverNewsApi.articles.list({ status: 'published' }),
    ])

    const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || (productsData as any)?.results || []
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.data || (articlesData as any)?.results || []

    return {
      featuredProducts: products.filter((p: Product) => p.featured).slice(0, 8),
      allProducts: products.slice(0, 8),
      latestArticles: articles.slice(0, 3),
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredProducts: [],
      allProducts: [],
      latestArticles: [],
    }
  }
}

export default async function HomePage() {
  const { featuredProducts, allProducts, latestArticles } = await getHomeData()
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-forest-primary to-forest-primary-dark text-white py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-6">
              Bring Nature Home
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Discover beautiful plants and expert care guides. 
              Every plant deserves a sanctuary—create yours today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn bg-forest-accent text-white hover:bg-forest-accent-dark">
                <Leaf className="w-5 h-5 mr-2" />
                Shop Plants
              </Link>
              <Link href="/articles" className="btn bg-white text-forest-primary hover:bg-gray-100">
                <BookOpen className="w-5 h-5 mr-2" />
                Care Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plants Section */}
      {displayProducts.length > 0 && (
        <section className="py-16 bg-white">
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
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
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
      <section className="py-16 bg-gradient-to-r from-forest-primary to-forest-primary-dark text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
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
