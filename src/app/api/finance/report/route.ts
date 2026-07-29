import { NextResponse } from 'next/server';
import { FinanceService } from '@/lib/api/services/finance-service';

const service = new FinanceService();

export async function GET() {
  try {
    const data = await service.getReport();
    return NextResponse.json({ status: true, message: 'Finance report retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching finance report', error: String(error) }, { status: 500 });
  }
}
