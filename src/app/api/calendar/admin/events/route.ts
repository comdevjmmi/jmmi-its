import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/api/services/calendar-service';
import { requireAuth } from '@/lib/api/auth';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const RECURRENCE_TYPES = ['weekly', 'monthly', 'custom_period'] as const;

function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

const service = new CalendarService();

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const data = await service.getAllEvents(page, limit, search);
    return NextResponse.json({ status: true, message: 'All calendar events retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching all calendar events', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const payload = await req.json();

    if (!payload.event_name || !payload.event_date || !payload.event_time || !payload.location) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields: event_name, event_date, event_time, location' },
        { status: 400 }
      );
    }

    if (!isValidDate(payload.event_date)) {
      return NextResponse.json({ status: false, message: 'Invalid event_date format' }, { status: 400 });
    }

    if (!TIME_PATTERN.test(payload.event_time)) {
      return NextResponse.json({ status: false, message: 'Invalid event_time format. Use HH:mm' }, { status: 400 });
    }

    if (
      payload.is_recurring &&
      (!payload.recurrence_type || !RECURRENCE_TYPES.includes(payload.recurrence_type))
    ) {
      return NextResponse.json(
        { status: false, message: 'Invalid recurrence_type. Use one of: weekly, monthly, custom_period' },
        { status: 400 }
      );
    }

    if (
      payload.is_recurring &&
      payload.recurrence_interval !== undefined &&
      !isValidPositiveInteger(payload.recurrence_interval)
    ) {
      return NextResponse.json({ status: false, message: 'recurrence_interval must be a positive integer' }, { status: 400 });
    }

    const data = await service.createEvent({
      ...payload,
      event_name: payload.event_name.trim(),
      location: payload.location.trim(),
      recurrence_type: payload.is_recurring ? payload.recurrence_type : null,
    });

    return NextResponse.json({ status: true, message: 'Calendar event created successfully', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating calendar event', error: String(error) }, { status: 500 });
  }
}
