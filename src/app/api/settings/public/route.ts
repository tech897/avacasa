import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    
    // Return only public settings (exclude sensitive data like email passwords)
    const publicSettings = {
      ...settings,
      emailPassword: '', // Don't expose email password
      adminEmail: '', // Don't expose admin email
    }

    return NextResponse.json({
      success: true,
      settings: publicSettings
    })
  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
} 