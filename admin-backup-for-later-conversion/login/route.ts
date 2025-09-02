import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateAdmin(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      admin: result.admin
    })

    // Set HTTP-only cookie
    response.cookies.set('admin-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 