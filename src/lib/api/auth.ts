import { NextResponse } from 'next/server';
import { AuthService } from './services/auth-service';

const authService = new AuthService();

export async function requireAuth(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { status: false, message: 'Authorization token required' },
      { status: 401 }
    );
  }

  const admin = await authService.verifyToken(token);

  if (!admin) {
    return NextResponse.json(
      { status: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return { adminId: admin.id, email: admin.email };
}
