import { NextRequest, NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await service.getLink(id);
    if (!data) {
      return NextResponse.json({ status: false, message: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: 'Link retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error', error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await service.updateLink(id, body);
    return NextResponse.json({ status: true, message: 'Link updated', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating link', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.deleteLink(id);
    return NextResponse.json({ status: true, message: 'Link deleted', data: null });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting link', error: String(error) }, { status: 500 });
  }
}
