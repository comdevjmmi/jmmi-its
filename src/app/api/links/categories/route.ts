import { NextRequest, NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET() {
  try {
    const data = await service.getAllCategories();
    return NextResponse.json({ status: true, message: 'Categories retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await service.createCategory(body);
    return NextResponse.json({ status: true, message: 'Category created', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating category', error: String(error) }, { status: 500 });
  }
}
