import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: slug,
        status: 'PUBLISHED',
        active: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        author: true,
        category: true,
        tags: true,
        featuredImage: true,
        featured: true,
        views: true,
        publishedAt: true,
        createdAt: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Parse tags
    const parsedPost = {
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : []
    }

    // Get related posts (same category, excluding current post)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        category: post.category,
        slug: { not: slug },
        status: 'PUBLISHED',
        active: true
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        author: true,
        category: true,
        featuredImage: true,
        publishedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: parsedPost,
      relatedPosts
    })
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Increment view count
    const post = await prisma.blogPost.update({
      where: { 
        slug: slug,
        status: 'PUBLISHED',
        active: true
      },
      data: {
        views: { increment: 1 }
      },
      select: {
        views: true
      }
    })

    return NextResponse.json({
      success: true,
      views: post.views,
      message: 'View tracked successfully'
    })
  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 