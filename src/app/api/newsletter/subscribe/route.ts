import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { trackUserActivity, getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = 'newsletter' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        await prisma.emailSubscriber.update({
          where: { email },
          data: {
            active: true,
            name: name || existingSubscriber.name,
            subscribedAt: new Date(),
            unsubscribedAt: null
          }
        })
      }
    } else {
      // Create new subscription
      await prisma.emailSubscriber.create({
        data: {
          email,
          name,
          source,
          active: true
        }
      })
    }

    // Track activity
    const user = await getUserFromRequest(request)
    await trackUserActivity(
      user?.id || null,
      'EMAIL_SUBSCRIBE',
      null,
      { email, source },
      request
    )

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 