import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/lib/api/services/finance-service';
import { requireAuth } from '@/lib/api/auth';

const service = new FinanceService();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { type, description, amount, transaction_at } = await req.json();

    const data = await service.updateTransaction(
      id,
      type,
      description,
      amount,
      transaction_at ? new Date(transaction_at) : undefined
    );

    if (!data) {
      return NextResponse.json({ status: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Transaction updated successfully', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error updating transaction', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const success = await service.deleteTransaction(id);

    if (!success) {
      return NextResponse.json({ status: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Error deleting transaction', error: String(error) }, { status: 500 });
  }
}
