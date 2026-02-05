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

  const cardClass =
    "rounded-[var(--savvy-radius)] border p-5 transition-shadow hover:shadow-sm";
  const cardStyle = {
    borderColor: "var(--savvy-border)",
    background: "var(--savvy-bg-elevated)",
  };
  const mutedClass = "text-sm font-medium text-[var(--savvy-text-muted)]";
  const valueClass = "mt-1 text-2xl font-semibold tracking-tight text-[var(--savvy-text-primary)] sm:text-3xl";
  const hintClass = "mt-1 text-xs text-[var(--savvy-text-muted)]";

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: "var(--savvy-bg)" }}
    >
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--savvy-text-primary)] sm:text-3xl">
            Inicio
          </h1>
          <p className="mt-1.5 text-[var(--savvy-text-secondary)]">
            Resumen de tus finanzas
          </p>
        </header>

        {loading && (
          <div className="flex justify-center py-20">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--savvy-gray-300)] border-t-[var(--savvy-accent)]"
              aria-hidden
            />
          </div>
        )}

        {error && (
          <div
            className="rounded-[var(--savvy-radius)] border p-4"
            style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg-elevated)" }}
          >
            <p className="text-sm text-[var(--savvy-text-secondary)]">
              No se pudieron cargar los datos.{" "}
              <Link href="/home" className="font-medium text-[var(--savvy-accent)] hover:underline">
                Ir a Finanzas
              </Link>
            </p>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className={cardClass} style={cardStyle}>
              <p className={mutedClass}>Pagos recurrentes</p>
              <p className={valueClass}>{stats.total}</p>
              <p className={hintClass}>Total activos</p>
            </article>
            <article className={cardClass} style={cardStyle}>
              <p className={mutedClass}>Por vencer (30 días)</p>
              <p className={`${valueClass} text-[var(--savvy-accent)]`}>{stats.porVencer30}</p>
              <p className={hintClass}>Próximo mes</p>
            </article>
            <article className={cardClass} style={cardStyle}>
              <p className={mutedClass}>Próximos 7 días</p>
              <p className={`${valueClass}`} style={{ color: "var(--savvy-accent)" }}>
                {stats.proximos7}
              </p>
              <p className={hintClass}>Revisar pronto</p>
            </article>
            <article className={cardClass} style={cardStyle}>
              <p className={mutedClass}>Total estimado</p>
              <p className={`${valueClass}`} style={{ color: "var(--savvy-accent)" }}>
                {formatearCOP(stats.totalMonto)}
              </p>
              <p className={hintClass}>Suma de montos</p>
            </article>
          </div>
        )}

        {!loading && !error && stats && stats.total === 0 && (
          <div
            className="mt-8 rounded-[var(--savvy-radius)] border p-8 text-center"
            style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg-elevated)" }}
          >
            <p className="text-[var(--savvy-text-secondary)]">
              Aún no hay pagos recurrentes.
            </p>
            <Link
              href="/home"
              className="mt-4 inline-block rounded-[var(--savvy-radius-sm)] bg-[var(--savvy-accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Cargar datos de ejemplo
            </Link>
          </div>
        )}

        {!loading && !error && stats && stats.total > 0 && (
          <div className="mt-8">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-[var(--savvy-radius-sm)] border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--savvy-gray-100)]"
              style={{ borderColor: "var(--savvy-border)", color: "var(--savvy-text-primary)", background: "var(--savvy-bg-elevated)" }}
            >
              Ver todos los pagos
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        {!loading && gastosStats && (
          <section
            className="mt-12 border-t pt-10"
            style={{ borderColor: "var(--savvy-border)" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-[var(--savvy-text-primary)]">
              Gastos n8n
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className={cardClass} style={cardStyle}>
                <p className={mutedClass}>Total ítems</p>
                <p className={valueClass}>{gastosStats.totalItems}</p>
                <p className={hintClass}>Registros</p>
              </article>
              <article className={cardClass} style={cardStyle}>
                <p className={mutedClass}>Total gastado</p>
                <p className={valueClass} style={{ color: "var(--savvy-accent)" }}>
                  {formatearCOP(gastosStats.totalGastado)}
                </p>
                <p className={hintClass}>Suma de totales</p>
              </article>
              <article className={cardClass} style={cardStyle}>
                <p className={mutedClass}>Categorías</p>
                <p className={valueClass}>{gastosStats.categorias}</p>
                <p className={hintClass}>Distintas</p>
              </article>
            </div>
            <div className="mt-4">
              <Link
                href="/gastos-n8n"
                className="inline-flex items-center gap-2 rounded-[var(--savvy-radius-sm)] border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--savvy-gray-100)]"
                style={{ borderColor: "var(--savvy-border)", color: "var(--savvy-text-primary)", background: "var(--savvy-bg-elevated)" }}
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
