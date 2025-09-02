import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const post = await prisma.blogPost.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags || []),
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Blog post creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 