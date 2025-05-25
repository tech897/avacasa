import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import BlogPostClient from '@/components/blog/blog-post-client'

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params
    
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: slug,
        status: 'PUBLISHED',
        active: true
      },
      select: {
        title: true,
        excerpt: true,
        author: true,
        category: true,
        tags: true,
        featuredImage: true,
        publishedAt: true
      }
    })

    if (!post) {
      return {
        title: 'Blog Post Not Found | Avacasa',
        description: 'The blog post you are looking for could not be found.'
      }
    }

    const tags = post.tags ? JSON.parse(post.tags) : []
    const keywords = [post.category, ...tags, 'real estate', 'property investment', 'avacasa'].join(', ')

    return {
      title: `${post.title} | Avacasa Blog`,
      description: post.excerpt,
      keywords,
      authors: [{ name: post.author }],
      category: post.category,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author],
        images: [
          {
            url: post.featuredImage,
            width: 1200,
            height: 630,
            alt: post.title
          }
        ],
        siteName: 'Avacasa'
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.featuredImage],
        creator: '@avacasa'
      },
      alternates: {
        canonical: `/blog/${slug}`
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Avacasa',
      description: 'Read our latest insights on real estate and property investment.'
    }
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  return <BlogPostClient slug={slug} />
} 