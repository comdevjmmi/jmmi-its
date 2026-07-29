import { NextRequest, NextResponse } from 'next/server';
import { LinksService, FolderAccessDeniedError } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || undefined;
    const data = await service.getFolderDetail(id, key);
    if (!data) {
      return NextResponse.json({ status: false, message: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: 'Folder detail retrieved', data });
  } catch (error) {
    if (error instanceof FolderAccessDeniedError) {
      return NextResponse.json({ status: false, message: 'Folder key is required or invalid' }, { status: 403 });
    }
    return NextResponse.json({ status: false, message: 'Error fetching folder detail', error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await service.updateFolder(id, body);
    return NextResponse.json({ status: true, message: 'Folder updated', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating folder', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.deleteFolder(id);
    return NextResponse.json({ status: true, message: 'Folder deleted', data: null });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting folder', error: String(error) }, { status: 500 });
  }
}
