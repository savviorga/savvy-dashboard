import { queryGastos } from "@/src/lib/db";
import { NextResponse } from "next/server";

export type ItemGastoRow = {
  id: number;
  external_id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio_unitario: string;
  total: string;
  moneda: string;
  created_at: string;
};

/**
 * GET /api/gastos-n8n
 * Lista todos los registros de public.items_gastos en la base db_savvy.
 */
export async function GET() {
  try {
    const rows = await queryGastos<ItemGastoRow>(
      `SELECT id, external_id, nombre, categoria, cantidad, precio_unitario, total, moneda, created_at
       FROM public.items_gastos
       ORDER BY id ASC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
