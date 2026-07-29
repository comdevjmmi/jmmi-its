import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/api/services/calendar-service';

const service = new CalendarService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const data = await service.getPublicEvents(page, limit, search);
    return NextResponse.json({ status: true, message: 'Calendar events retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching calendar events', error: String(error) }, { status: 500 });
  }
}
