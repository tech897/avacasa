import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    const { id } = await params
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        inquiries: {
          include: {
            property: {
              select: {
                title: true,
                slug: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        favorites: {
          include: {
            property: {
              select: {
                title: true,
                slug: true,
                price: true,
                images: true
              }
            }
          }
        },
        _count: {
          select: {
            activities: true,
            inquiries: true,
            favorites: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields in favorites
    const userWithParsedData = {
      ...user,
      favorites: user.favorites.map(fav => ({
        ...fav,
        property: {
          ...fav.property,
          images: JSON.parse(fav.property.images || '[]')
        }
      }))
    }

    return NextResponse.json({ user: userWithParsedData })
  } catch (error) {
    console.error('User fetch error:', error)
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

    const { id } = await params
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        active: data.active,
        verified: data.verified
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User update error:', error)
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

    const { id } = await params
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete user and all related data (cascading deletes handled by Prisma)
    await prisma.user.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 