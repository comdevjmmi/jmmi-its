import { NextRequest, NextResponse } from 'next/server';
import { ShortLinksService } from '@/lib/api/services/shortlinks-service';

const service = new ShortLinksService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const data = await service.getAll(page, limit, search);
    return NextResponse.json({ status: true, message: 'Short links retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching short links', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await service.create(body);
    return NextResponse.json({ status: true, message: 'Short link created', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating short link', error: String(error) }, { status: 500 });
  }
}
