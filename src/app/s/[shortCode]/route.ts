import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_RUN_MODE === 'development'
    ? process.env.NEXT_PUBLIC_API_URL_DEV
    : process.env.NEXT_PUBLIC_API_URL_PROD;

const normalizeApiBase = (raw?: string): string => {
  if (!raw) return 'http://localhost:3333';
  let base = raw.replace(/\/+$/, '');
  if (base.endsWith('/api')) base = base.slice(0, -4);
  return base;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const backendBase = normalizeApiBase(API_BASE);

  // Proxy the redirect to the backend
  const backendUrl = `${backendBase}/s/${shortCode}`;

  try {
    const res = await fetch(backendUrl, { redirect: 'manual' });

    const location = res.headers.get('location');
    if (location) {
      return NextResponse.redirect(location, 302);
    }

    // If no redirect, short link not found
    return NextResponse.json(
      { status: false, message: 'Short link not found' },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { status: false, message: 'Error resolving short link' },
      { status: 500 }
    );
  }
}
