import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { clearSettingsCache } from '@/lib/settings'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = await getAdminFromRequest(request)
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear settings cache
    clearSettingsCache()

    // Log the cache clear action
    console.log(`Cache cleared by admin: ${adminPayload.email}`)

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 