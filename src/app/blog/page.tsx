import { Metadata } from 'next'
import BlogClient from '@/components/blog/blog-client'

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Real Estate Blog | Property Investment Insights | Avacasa',
  description: 'Discover expert insights on real estate investment, property market trends, legal guides, and lifestyle tips. Your comprehensive resource for property investment in India.',
  keywords: 'real estate blog, property investment, market analysis, legal guide, holiday homes, farmland investment, property trends, real estate insights',
  openGraph: {
    title: 'Real Estate Blog | Property Investment Insights | Avacasa',
    description: 'Discover expert insights on real estate investment, property market trends, legal guides, and lifestyle tips.',
    type: 'website',
    siteName: 'Avacasa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Avacasa Real Estate Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate Blog | Property Investment Insights | Avacasa',
    description: 'Discover expert insights on real estate investment, property market trends, legal guides, and lifestyle tips.',
    creator: '@avacasa'
  },
  alternates: {
    canonical: '/blog'
  }
}

export default function BlogPage() {
  return <BlogClient />
} 