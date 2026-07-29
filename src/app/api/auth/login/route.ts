import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/api/services/auth-service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authService.login(email, password);

    if (!result) {
      return NextResponse.json(
        { status: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('Error in auth/login:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
