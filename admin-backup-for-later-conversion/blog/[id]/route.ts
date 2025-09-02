import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const db = await getDatabase()

    const post = await db.collection('blog_posts').findOne({
      _id: new ObjectId(id)
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Transform _id to id for frontend compatibility
    const transformedPost = {
      ...post,
      id: post._id.toString()
    }
    delete (transformedPost as any)._id

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()
    const db = await getDatabase()
    
    // Process JSON fields if they exist
    const updateData: any = { ...data }
    if (data.tags) updateData.tags = JSON.stringify(data.tags)
    
    // Handle publish status
    if (data.status === 'PUBLISHED' && !updateData.publishedAt) {
      updateData.publishedAt = new Date()
    } else if (data.status !== 'PUBLISHED') {
      updateData.publishedAt = null
    }

    updateData.updatedAt = new Date()

    const result = await db.collection('blog_posts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Fetch updated post
    const post = await db.collection('blog_posts').findOne({
      _id: new ObjectId(id)
    })

    const transformedPost = {
      ...post,
      id: post?._id.toString()
    }
    delete (transformedPost as any)._id

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const db = await getDatabase()

    const result = await db.collection('blog_posts').deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog post deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 