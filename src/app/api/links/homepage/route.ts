import { NextResponse } from 'next/server';
import { LinksService } from '@/lib/api/services/links-service';

const service = new LinksService();

export async function GET() {
  try {
    const data = await service.getHomepageData();
    return NextResponse.json({ status: true, message: 'Homepage data retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching homepage data', error: String(error) }, { status: 500 });
  }
}
