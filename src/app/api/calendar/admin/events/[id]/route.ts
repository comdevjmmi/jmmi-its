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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const payload = await req.json();

    if (payload.event_date !== undefined && !isValidDate(payload.event_date)) {
      return NextResponse.json({ status: false, message: 'Invalid event_date format' }, { status: 400 });
    }

    if (payload.event_time !== undefined && !TIME_PATTERN.test(payload.event_time)) {
      return NextResponse.json({ status: false, message: 'Invalid event_time format. Use HH:mm' }, { status: 400 });
    }

    if (
      payload.recurrence_type !== undefined &&
      payload.recurrence_type !== null &&
      !RECURRENCE_TYPES.includes(payload.recurrence_type)
    ) {
      return NextResponse.json(
        { status: false, message: 'Invalid recurrence_type. Use one of: weekly, monthly, custom_period' },
        { status: 400 }
      );
    }

    if (payload.is_recurring === true && !payload.recurrence_type) {
      return NextResponse.json(
        { status: false, message: 'recurrence_type is required when is_recurring is true' },
        { status: 400 }
      );
    }

    if (
      payload.recurrence_interval !== undefined &&
      !isValidPositiveInteger(payload.recurrence_interval)
    ) {
      return NextResponse.json({ status: false, message: 'recurrence_interval must be a positive integer' }, { status: 400 });
    }

    const data = await service.updateEvent(id, {
      ...payload,
      event_name: payload.event_name !== undefined ? payload.event_name.trim() : payload.event_name,
      location: payload.location !== undefined ? payload.location.trim() : payload.location,
    });

    if (!data) {
      return NextResponse.json({ status: false, message: 'Calendar event not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Calendar event updated successfully', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating calendar event', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const success = await service.deleteEvent(id);

    if (!success) {
      return NextResponse.json({ status: false, message: 'Calendar event not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Calendar event deleted successfully' });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting calendar event', error: String(error) }, { status: 500 });
  }
}
