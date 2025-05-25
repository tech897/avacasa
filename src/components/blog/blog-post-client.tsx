"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Eye, 
  Tag, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  ArrowLeft,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CallButton } from "@/components/common/call-button"
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  tags: string[]
  featuredImage: string
  featured: boolean
  views: number
  publishedAt: string
  createdAt: string
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  featuredImage: string
  publishedAt: string
}

interface BlogPostClientProps {
  slug: string
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [readingTime, setReadingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  useEffect(() => {
    // Track view when component mounts
    const trackView = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'view' })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.views) {
            // Update the views count in the UI
            setPost(prev => prev ? { ...prev, views: data.views } : null)
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    if (slug) {
      trackView()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.data)
        setRelatedPosts(data.relatedPosts || [])
        
        // Calculate reading time (average 200 words per minute)
        const wordCount = data.data.content.split(' ').length
        setReadingTime(Math.ceil(wordCount / 200))
      } else {
        setError(data.error || 'Failed to fetch post')
      }
    } catch (err) {
      console.error('Error fetching post:', err)
      setError('Failed to fetch post')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async (platform?: string) => {
    if (!post) return

    const url = window.location.href
    const title = post.title
    const text = post.excerpt

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (error) {
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {error === 'Post not found' ? 'Blog Post Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-8">
            {error === 'Post not found' 
              ? 'The blog post you are looking for could not be found.' 
              : 'We encountered an error while loading this blog post.'}
          </p>
          <a 
            href="/blog" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 mt-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <span className="mx-2">/</span>
            <Link href={`/blog?category=${post.category}`} className="hover:text-gray-900">{post.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button variant="outline" size="sm" className="mb-6" asChild>
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>

            {/* Article Meta */}
            <div className="mb-6">
              <Badge className="bg-gray-900 text-white mb-4">
                {post.category}
              </Badge>
              {post.featured && (
                <Badge className="bg-yellow-500 text-white ml-2 mb-4">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Article Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {readingTime} min read
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                {post.views?.toLocaleString() || 0} views
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.author}
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare()}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Property Investment Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Explore our curated collection of <Link href="/properties?type=holiday-home" className="text-blue-600 hover:underline">holiday homes</Link> and <Link href="/properties?type=farmland" className="text-blue-600 hover:underline">farmlands</Link> in prime locations across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <CallButton variant="outline" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gray-900 text-white">
                          {relatedPost.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{relatedPost.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(relatedPost.publishedAt)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 group"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated with Our Latest Insights
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get expert real estate advice, market updates, and investment tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 