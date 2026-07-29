import { NextRequest, NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET() {
  try {
    const data = await service.getAllLinks();
    return NextResponse.json({ status: true, message: 'Links retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await service.createLink(body);
    return NextResponse.json({ status: true, message: 'Link created', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating link', error: String(error) }, { status: 500 });
  }
}
