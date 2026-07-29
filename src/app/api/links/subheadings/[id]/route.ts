import { NextRequest, NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await service.getSubheading(id);
    if (!data) {
      return NextResponse.json({ status: false, message: 'Subheading not found' }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: 'Subheading retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error', error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await service.updateSubheading(id, body);
    return NextResponse.json({ status: true, message: 'Subheading updated', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating subheading', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.deleteSubheading(id);
    return NextResponse.json({ status: true, message: 'Subheading deleted', data: null });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting subheading', error: String(error) }, { status: 500 });
  }
}
