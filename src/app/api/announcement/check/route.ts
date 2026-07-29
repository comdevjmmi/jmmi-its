import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementsService } from '@/lib/api/services/announcements-service';

const service = new AnnouncementsService();

export async function POST(req: NextRequest) {
  try {
    const { nrp } = await req.json();

    if (!nrp) {
      return NextResponse.json(
        { status: 'error', message: 'NRP is required' },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(nrp) || nrp.length > 20) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid NRP format' },
        { status: 400 }
      );
    }

    const result = await service.checkStatus(nrp);

    return NextResponse.json({ status: 'success', data: result });
  } catch (error) {
    console.error('Error in announcement/check:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
