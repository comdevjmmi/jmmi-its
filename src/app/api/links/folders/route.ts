import { NextRequest, NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id') || undefined;
    const data = await service.getAllFolders(categoryId);
    return NextResponse.json({ status: true, message: 'Folders retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await service.createFolder(body);
    return NextResponse.json({ status: true, message: 'Folder created', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating folder', error: String(error) }, { status: 500 });
  }
}
