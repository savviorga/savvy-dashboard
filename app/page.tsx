"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PaymentItem = {
  id: string;
  nombre: string;
  fechaMaxima: string;
  monto: number;
  icono: string;
  proveedor: string | null;
  currency: string;
};

type ItemGasto = {
  id: number;
  nombre: string;
  categoria: string;
  total: string;
  moneda: string;
};

function diasFaltantes(fechaMax: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaMax);
  fin.setHours(0, 0, 0, 0);
  const diff = fin.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function Home() {
  const [data, setData] = useState<PaymentItem[] | null>(null);
  const [gastosData, setGastosData] = useState<ItemGasto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/recurring-payments").then((res) => {
        if (!res.ok) throw new Error("Error al cargar");
        return res.json();
      }),
      fetch("/api/gastos-n8n").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([payments, gastos]) => {
        setData(payments);
        setGastosData(Array.isArray(gastos) ? gastos : null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? {
        total: data.length,
        porVencer30: data.filter((p) => {
          const d = diasFaltantes(p.fechaMaxima);
          return d >= 0 && d <= 30;
        }).length,
        proximos7: data.filter((p) => {
          const d = diasFaltantes(p.fechaMaxima);
          return d >= 0 && d <= 7;
        }).length,
        totalMonto: data.reduce((s, p) => s + p.monto, 0),
      }
    : null;

  const gastosStats =
    gastosData && gastosData.length >= 0
      ? {
          totalItems: gastosData.length,
          totalGastado: gastosData.reduce((s, g) => s + Number(g.total), 0),
          categorias: new Set(gastosData.map((g) => g.categoria)).size,
        }
      : null;

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Inicio
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Resumen de tus finanzas personales
          </p>
        </header>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 dark:border-zinc-600 dark:border-t-emerald-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              No se pudieron cargar los datos.{" "}
              <Link href="/home" className="font-medium underline">
                Ir a Finanzas
              </Link>
            </p>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Pagos recurrentes
              </p>
              <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats.total}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Total activos
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Por vencer (30 días)
              </p>
              <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {stats.porVencer30}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Próximo mes
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Próximos 7 días
              </p>
              <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.proximos7}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Requieren atención
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Total estimado
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatearCOP(stats.totalMonto)}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Suma de montos
              </p>
            </article>
          </div>
        )}

        {!loading && !error && stats && stats.total === 0 && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              Aún no hay pagos recurrentes.
            </p>
            <Link
              href="/home"
              className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Ir a Finanzas y cargar datos
            </Link>
          </div>
        )}

        {!loading && !error && stats && stats.total > 0 && (
          <div className="mt-8">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Ver todos los pagos
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        {/* Gastos n8n: conteos */}
        {!loading && gastosStats && (
          <section className="mt-10 border-t border-zinc-200 pt-10 dark:border-zinc-700">
            <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Gastos n8n
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total ítems
                </p>
                <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {gastosStats.totalItems}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Registros en items_gastos
                </p>
              </article>
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total gastado
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatearCOP(gastosStats.totalGastado)}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Suma de totales
                </p>
              </article>
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Categorías
                </p>
                <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {gastosStats.categorias}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Distintas categorías
                </p>
              </article>
            </div>
            <div className="mt-4">
              <Link
                href="/gastos-n8n"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Ver listado de gastos n8n
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
