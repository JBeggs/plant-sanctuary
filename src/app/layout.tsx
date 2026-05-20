import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { serverNewsApi } from '@/lib/api-server'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import {
  DEFAULT_THEME,
  THEMES,
  THEME_BOOTSTRAP_SCRIPT,
  type Theme,
} from '@/contexts/theme-config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieConsentBanner } from '@/components/layout/CookieConsentBanner'

export const dynamic = 'force-dynamic'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await serverNewsApi.siteSettings.list() as any
    const settingsArray = Array.isArray(settings) ? settings : (settings?.results || [])
    
    function tryParseJSON(value: string) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    const settingsMap = settingsArray.reduce((acc: Record<string, any>, setting: any) => ({
      ...acc,
      [setting.key]: tryParseJSON(setting.value)
    }), {})
    
    const siteName = settingsMap.site_name || 'Plant Sanctuary'
    const tagline = settingsMap.site_tagline || 'Plants & Care'
    const description = settingsMap.site_description || 'Discover beautiful plants and expert care guides. Bring nature home with Plant Sanctuary.'
    
    return {
      title: `${siteName} | ${tagline}`,
      description,
      icons: { icon: '/favicon.avif' },
      openGraph: {
        title: `${siteName} | ${tagline}`,
        description,
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'Plant Sanctuary | Plants & Care',
      description: 'Discover beautiful plants and expert care guides. Bring nature home with Plant Sanctuary.',
      icons: { icon: '/favicon.avif' },
    }
  }
}

export const metadata = await generateMetadata()

function readThemeCookie(value: string | undefined): Theme {
  if (value && (THEMES as readonly string[]).includes(value)) return value as Theme
  return DEFAULT_THEME
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const initialTheme = readThemeCookie(cookieStore.get('site_theme')?.value)

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${inter.variable} ${playfair.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${inter.className} antialiased bg-forest-background text-text`}>
        <ThemeProvider initialTheme={initialTheme}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Suspense fallback={<div className="h-20 bg-surface border-b border-border" />}>
                    <Header />
                  </Suspense>
                  <main className="flex-1">
                    {children}
                  </main>
                  <Suspense fallback={<div className="h-64 bg-brand-band" />}>
                    <Footer />
                  </Suspense>
                </div>
                <CookieConsentBanner />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
