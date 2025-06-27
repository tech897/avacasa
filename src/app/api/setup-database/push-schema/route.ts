import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting schema push to production database...')
    
    // Run prisma db push command
    console.log('📤 Pushing schema to database...')
    
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      },
      timeout: 60000 // 60 seconds timeout
    })
    
    console.log('Schema push output:', stdout)
    if (stderr) {
      console.log('Schema push warnings:', stderr)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully!',
      output: stdout,
      warnings: stderr || null
    })
    
  } catch (error) {
    console.error('❌ Schema push failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Schema push failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check Vercel function logs for more details'
    }, { status: 500 })
  }
}

// Also allow GET for easy browser testing
export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to push schema',
    instruction: 'Send POST request to this endpoint to create database tables'
  })
} 