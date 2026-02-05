import { query } from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Frequency = "monthly" | "weekly" | "yearly";

/**
 * Calcula la próxima fecha de pago a partir de start_date y frequency.
 */
function nextDueDate(
  startDate: Date,
  frequency: Frequency,
  endDate: Date | null,
  fromDate: Date = new Date()
): Date {
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (from > end) return end;
  }

  if (frequency === "weekly") {
    const dayOfWeek = start.getDay();
    const currentDay = from.getDay();
    let diff = dayOfWeek - currentDay;
    if (diff < 0) diff += 7;
    if (diff === 0 && from < start) return start;
    const next = new Date(from);
    next.setDate(next.getDate() + (diff === 0 ? 7 : diff));
    return next;
  }

  if (frequency === "monthly") {
    const dayOfMonth = start.getDate();
    const next = new Date(from.getFullYear(), from.getMonth(), dayOfMonth);
    if (next < from) next.setMonth(next.getMonth() + 1);
    if (endDate && next > new Date(endDate)) return new Date(endDate);
    return next;
  }

  if (frequency === "yearly") {
    const next = new Date(from.getFullYear(), start.getMonth(), start.getDate());
    if (next < from) next.setFullYear(next.getFullYear() + 1);
    if (endDate && next > new Date(endDate)) return new Date(endDate);
    return next;
  }

  return start;
}

type DbRow = {
  id: string;
  name: string;
  provider: string | null;
  icon: string | null;
  amount: string;
  currency: string;
  frequency: string;
  start_date: Date;
  end_date: Date | null;
};

export type RecurringPaymentResponse = {
  id: string;
  nombre: string;
  fechaMaxima: string; // ISO
  monto: number;
  icono: string;
  proveedor: string | null;
  currency: string;
};

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

/**
 * GET /api/recurring-payments
 * Lista pagos recurrentes activos. Opcional: ?userId=uuid (si no se envía, usa usuario por defecto)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? DEFAULT_USER_ID;

    const rows = await query<DbRow>(
      `SELECT id, name, provider, icon, amount, currency, frequency, start_date, end_date
       FROM recurring_payments
       WHERE user_id = $1 AND status = 'active'
       ORDER BY sequence_id ASC`,
      [userId]
    );

    const now = new Date();
    const frequencyMap = {
      monthly: "monthly" as Frequency,
      weekly: "weekly" as Frequency,
      yearly: "yearly" as Frequency,
    };

    const items: RecurringPaymentResponse[] = rows.map((row) => {
      const start = new Date(row.start_date);
      const end = row.end_date ? new Date(row.end_date) : null;
      const freq =
        frequencyMap[row.frequency as keyof typeof frequencyMap] ?? "monthly";
      const fechaMaxima = nextDueDate(start, freq, end, now);

      return {
        id: row.id,
        nombre: row.name,
        fechaMaxima: fechaMaxima.toISOString(),
        monto: Number(row.amount),
        icono: row.icon ?? "📌",
        proveedor: row.provider,
        currency: row.currency,
      };
    });

    return NextResponse.json(items);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
