import { NextRequest, NextResponse } from 'next/server';

// TEMPORARILY DISABLED: This route is being migrated from Prisma to MongoDB
// TODO: Convert Prisma calls to MongoDB and re-enable


export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This feature is temporarily unavailable during database migration',
      message: 'We are upgrading our systems. This feature will be restored soon.',
      status: 'maintenance'
    }, 
    { status: 503 }
  );
}
