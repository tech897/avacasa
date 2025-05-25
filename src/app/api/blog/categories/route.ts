import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all categories with post counts
    const categories = await prisma.blogPost.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED'
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    // Get total published posts count
    const totalPosts = await prisma.blogPost.count({
      where: {
        status: 'PUBLISHED'
      }
    })

    // Format response with "All" category
    const formattedCategories = [
      {
        name: 'All',
        count: totalPosts
      },
      ...categories.map(cat => ({
        name: cat.category,
        count: cat._count.category
      }))
    ]

    return NextResponse.json({
      success: true,
      data: formattedCategories
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 