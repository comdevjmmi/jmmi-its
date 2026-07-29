import { NextRequest, NextResponse } from 'next/server';
import { ShortLinksService } from '@/lib/api/services/shortlinks-service';

const service = new ShortLinksService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await service.getById(id);
    if (!data) {
      return NextResponse.json({ status: false, message: 'Short link not found' }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: 'Short link retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching short link', error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await service.update(id, body);
    return NextResponse.json({ status: true, message: 'Short link updated', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating short link', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.delete(id);
    return NextResponse.json({ status: true, message: 'Short link deleted', data: null });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting short link', error: String(error) }, { status: 500 });
  }
}
