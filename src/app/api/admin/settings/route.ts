import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminPayload = await getAdminFromRequest(request)
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get settings from database
    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' }
    })

    let settings = {}
    if (siteSettings) {
      try {
        settings = JSON.parse(siteSettings.data)
      } catch (error) {
        console.error('Failed to parse settings data:', error)
        settings = {}
      }
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { settings } = await request.json()

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      )
    }

    // Save settings to database
    await prisma.siteSettings.upsert({
      where: { id: 'settings' },
      update: {
        data: JSON.stringify(settings),
        updatedAt: new Date()
      },
      create: {
        id: 'settings',
        data: JSON.stringify(settings)
      }
    })

    // Log the settings update
    console.log(`Settings updated by admin: ${adminPayload.email}`)

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 