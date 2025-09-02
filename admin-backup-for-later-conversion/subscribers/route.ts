import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscribers = await prisma.emailSubscriber.findMany({
      orderBy: {
        subscribedAt: 'desc'
      }
    })

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error('Subscribers fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 