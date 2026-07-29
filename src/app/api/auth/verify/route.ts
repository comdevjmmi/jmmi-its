import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/api/services/auth-service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Token required' },
        { status: 401 }
      );
    }

    const admin = await authService.verifyToken(token);

    if (!admin) {
      return NextResponse.json(
        { status: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Token valid',
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch {
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
