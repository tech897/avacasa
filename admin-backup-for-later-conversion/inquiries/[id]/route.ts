import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data,
      include: {
        property: {
          select: {
            title: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Inquiry update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 