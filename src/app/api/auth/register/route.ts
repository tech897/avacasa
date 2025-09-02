import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password, name);

    if (result.success) {
      const response = NextResponse.json({ 
        success: true, 
        token: result.token,
        user: result.user 
      });
      
      // Set HTTP-only cookie
      response.cookies.set('user-token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}