import { NextRequest, NextResponse } from 'next/server';
import { ShortLinksService } from '@/lib/api/services/shortlinks-service';

const service = new ShortLinksService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  try {
    const data = await service.redirectShortLink(shortCode);

    if (!data) {
      return NextResponse.json(
        { status: false, message: 'Short link not found' },
        { status: 404 }
      );
    }

    return NextResponse.redirect(data.url, 302);
  } catch {
    return NextResponse.json(
      { status: false, message: 'Error resolving short link' },
      { status: 500 }
    );
  }
}
