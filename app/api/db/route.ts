import { testConnection } from "@/src/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/db
 * Prueba la conexión a PostgreSQL. Útil para verificar que DATABASE_URL está bien configurada.
 */
export async function GET() {
  try {
    const result = await testConnection();
    if (result.ok) {
      return NextResponse.json({ ok: true, message: "Conexión a PostgreSQL correcta" });
    }
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 503 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 503 }
    );
  }
}
