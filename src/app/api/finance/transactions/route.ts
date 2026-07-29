import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/lib/api/services/finance-service';

const service = new FinanceService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const data = await service.getAllTransactions(page, limit);
    return NextResponse.json({ status: true, message: 'All transactions retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error fetching transactions', error: String(error) }, { status: 500 });
  }
}
