import { query } from "@/src/lib/db";
import { NextResponse } from "next/server";

export type TransactionRow = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  account: string;
  description: string | null;
};

/**
 * GET /api/transactions
 * Lista todas las transacciones ordenadas por id.
 */
export async function GET() {
  try {
    const rows = await query<TransactionRow>(
      `SELECT id, date, type, amount, category, account, description
       FROM public.transactions
       ORDER BY id ASC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
