import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/lib/api/services/finance-service';
import { requireAuth } from '@/lib/api/auth';

const service = new FinanceService();

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

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

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { type, fund_type, description, amount, transaction_at } = await req.json();

    if (!type || !description || !amount || !transaction_at) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields: type, description, amount, transaction_at' },
        { status: 400 }
      );
    }

    const data = await service.createTransaction(type, description, amount, new Date(transaction_at), fund_type);

    return NextResponse.json({ status: true, message: 'Transaction created successfully', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error creating transaction', error: String(error) }, { status: 500 });
  }
}
