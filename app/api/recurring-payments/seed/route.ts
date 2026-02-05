import { pool } from "@/src/lib/db";
import { NextResponse } from "next/server";

const SEED_DATA = [
  { name: "Gas natural", provider: "Gas Natural Fenosa", icon: "🔥", amount: 85000 },
  { name: "Energía", provider: "Codensa", icon: "⚡", amount: 185000 },
  { name: "Acueducto y alcantarillado", provider: "EAAB", icon: "💧", amount: 95000 },
  { name: "Internet y plan de datos", provider: "Claro", icon: "📶", amount: 129900 },
  { name: "Arriendo", provider: null, icon: "🏠", amount: 1200000 },
  { name: "Gimnasio", provider: "Bodytech", icon: "💪", amount: 89900 },
  { name: "Netflix", provider: null, icon: "📺", amount: 44900 },
  { name: "Soat", provider: "Vencimiento anual", icon: "🚗", amount: 520000 },
  { name: "TV cable", provider: "Movistar", icon: "📡", amount: 79900 },
  { name: "Cuota tarjeta de crédito", provider: "Bancolombia", icon: "💳", amount: 350000 },
  { name: "Celular pospago", provider: "Tigo", icon: "📱", amount: 65000 },
  { name: "Cuota crédito moto", provider: "Credifinanciera", icon: "🏍️", amount: 420000 },
  { name: "Spotify Premium", provider: null, icon: "🎵", amount: 21900 },
  { name: "Disney+", provider: null, icon: "🎬", amount: 34900 },
  { name: "Contribución predial", provider: "Cuota 1/4", icon: "🏛️", amount: 280000 },
  { name: "Parqueadero", provider: "Edificio Centro", icon: "🅿️", amount: 180000 },
  { name: "Plan dental", provider: "Sura", icon: "🦷", amount: 45000 },
  { name: "Cuota crédito libre inversión", provider: "Davivienda", icon: "🏦", amount: 195000 },
  { name: "Seguro de vida", provider: "Allianz", icon: "🛡️", amount: 125000 },
  { name: "Mercado (cuota fija ahorro)", provider: null, icon: "🛒", amount: 450000 },
];

// Fechas de inicio = próxima fecha de pago (variadas feb–abr 2026)
const START_DATES = [
  "2026-02-19", "2026-02-12", "2026-02-28", "2026-02-25", "2026-02-05",
  "2026-02-15", "2026-02-10", "2026-03-08", "2026-02-22", "2026-02-18",
  "2026-02-07", "2026-03-12", "2026-02-14", "2026-02-20", "2026-03-25",
  "2026-02-28",
  "2026-03-05", "2026-03-15", "2026-02-08", "2026-04-03",
];

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

/**
 * POST /api/recurring-payments/seed
 * Inserta los 20 pagos recurrentes de ejemplo (user_id por defecto).
 */
export async function POST() {
  try {
    const userId = DEFAULT_USER_ID;
    const client = await pool.connect();
    try {
      for (let i = 0; i < SEED_DATA.length; i++) {
        const row = SEED_DATA[i];
        const startDate = START_DATES[i] ?? "2026-02-19";
        await client.query(
          `INSERT INTO recurring_payments (user_id, name, provider, icon, amount, currency, frequency, start_date, status)
           VALUES ($1, $2, $3, $4, $5, 'COP', 'monthly', $6::date, 'active')`,
          [userId, row.name, row.provider, row.icon, row.amount, startDate]
        );
      }
      return NextResponse.json({
        ok: true,
        message: `Insertados ${SEED_DATA.length} pagos recurrentes.`,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
