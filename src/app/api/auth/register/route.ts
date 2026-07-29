import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/api/services/auth-service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { status: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const result = await authService.register(email, password, name);

    if (!result) {
      return NextResponse.json(
        { status: false, message: 'Failed to register admin' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: 'Admin registered successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in auth/register:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
