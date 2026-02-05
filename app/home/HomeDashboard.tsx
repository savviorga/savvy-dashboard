"use client";

import { useEffect, useMemo, useState } from "react";

type PagoRecurrente = {
  id: string;
  nombre: string;
  fechaMaxima: Date;
  monto: number; // en pesos colombianos
  icono: string;
  proveedor?: string;
};

// Formatear pesos colombianos: $ 1.234.567
function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

const DIAS_PERIODO = 31;

/** Convierte la respuesta de la API a PagoRecurrente */
function mapApiToPago(item: {
  id: string;
  nombre: string;
  fechaMaxima: string;
  monto: number;
  icono: string;
  proveedor?: string | null;
}): PagoRecurrente {
  return {
    id: item.id,
    nombre: item.nombre,
    fechaMaxima: new Date(item.fechaMaxima),
    monto: item.monto,
    icono: item.icono,
    proveedor: item.proveedor ?? undefined,
  };
}

function diasFaltantes(fechaMax: Date, hoy: Date): number {
  const inicio = new Date(hoy);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fechaMax);
  fin.setHours(0, 0, 0, 0);
  const diff = fin.getTime() - inicio.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatearFecha(d: Date): string {
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type FiltroOrden = "proximo" | "monto" | "nombre";

function BarraProgreso({
  diasRestantes,
  animar,
  delay,
}: {
  diasRestantes: number;
  animar?: boolean;
  delay?: number;
}) {
  const porcentaje = Math.min(
    100,
    Math.max(0, Math.round((diasRestantes / DIAS_PERIODO) * 100))
  );
  const urgente = diasRestantes <= 3;
  const pronto = diasRestantes <= 7 && diasRestantes > 3;

  return (
    <div
      className={`space-y-1.5 ${
        diasRestantes === 0
          ? "rounded-[var(--savvy-radius-sm)] border border-red-500/80 bg-red-50/80 p-2 dark:bg-red-950/20 savvy-pulse-urgent"
          : ""
      }`}
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium text-[var(--savvy-text-muted)]">
          Días faltantes
        </span>
        <span
          className="font-semibold"
          style={{
            color:
              diasRestantes === 0
                ? "#dc2626"
                : urgente
                ? "#dc2626"
                : pronto
                ? "#d97706"
                : "var(--savvy-accent)",
          }}
        >
          {diasRestantes === 0
            ? "Vence hoy"
            : diasRestantes < 0
              ? "Vencido"
              : `${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--savvy-gray-200)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${porcentaje}%`,
            backgroundColor:
              diasRestantes === 0
                ? "#dc2626"
                : urgente
                ? "#dc2626"
                : pronto
                ? "#d97706"
                : "var(--savvy-accent)",
            ...(animar && {
              animation: "progress-in 0.8s ease-out forwards",
              animationDelay: delay ? `${delay}ms` : undefined,
            }),
          }}
        />
      </div>
    </div>
  );
}

function TarjetaPago({
  pago,
  hoy,
  index,
}: {
  pago: PagoRecurrente;
  hoy: Date;
  index: number;
}) {
  const dias = useMemo(
    () => diasFaltantes(pago.fechaMaxima, hoy),
    [pago.fechaMaxima, hoy]
  );

  const venceHoy = dias === 0;

  return (
    <article
      className={`rounded-[var(--savvy-radius)] border p-5 transition-all hover:shadow-sm ${
        venceHoy ? "border-red-500 bg-red-300/90 dark:bg-red-950/30 savvy-pulse-urgent" : ""
      }`}
      style={{
        borderColor: venceHoy ? "#dc2626" : "var(--savvy-border)",
        background: venceHoy ? undefined : "var(--savvy-bg-elevated)",
        animation: "fade-in 0.4s ease-out forwards",
        animationDelay: `${index * 60}ms`,
        opacity: 0,
      }}
    >
      {venceHoy && (
        <div
          className="mb-4 flex items-start gap-2 rounded-[var(--savvy-radius-sm)] border border-red-400/80 bg-red-300/90 px-3 py-2.5 dark:border-red-600/80 dark:bg-red-900/40"
          role="alert"
        >
          <span className="text-lg leading-none" aria-hidden>
            ⚠️
          </span>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            Riesgo de no pago — Realiza el pago hoy para evitar cargos adicionales o cortes del servicio.
          </p>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--savvy-radius-sm)] text-2xl ${
            venceHoy ? "bg-red-200/80 dark:bg-red-800/50" : ""
          }`}
          style={!venceHoy ? { background: "var(--savvy-gray-100)" } : undefined}
        >
          {pago.icono}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold ${venceHoy ? "text-red-900 dark:text-red-100" : "text-[var(--savvy-text-primary)]"}`}>
              {pago.nombre}
            </h3>
            {pago.proveedor && (
              <span
                className="rounded-full px-2 py-0.5 text-xs text-[var(--savvy-text-muted)]"
                style={{ background: "var(--savvy-gray-100)" }}
              >
                {pago.proveedor}
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-lg font-semibold ${venceHoy ? "text-red-900 dark:text-red-100" : "text-[var(--savvy-text-primary)]"}`}>
            {formatearCOP(pago.monto)}
          </p>
          <p className={`mt-1 text-sm ${venceHoy ? "text-red-700 dark:text-red-300" : "text-[var(--savvy-text-muted)]"}`}>
            Fecha máxima de pago:{" "}
            <time dateTime={pago.fechaMaxima.toISOString().slice(0, 10)}>
              {formatearFecha(pago.fechaMaxima)}
            </time>
          </p>
          <div className="mt-4">
            <BarraProgreso
              diasRestantes={dias}
              animar
              delay={index * 80}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export type HomeDashboardProps = {
  initialDate: string; // ISO string para que servidor y cliente coincidan al hidratar
};

const API_PAGOS = "/api/recurring-payments";
const API_SEED = "/api/recurring-payments/seed";

export default function HomeDashboard({ initialDate }: HomeDashboardProps) {
  const [orden, setOrden] = useState<FiltroOrden>("proximo");
  const [hoy, setHoy] = useState(() => new Date(initialDate));
  const [pagos, setPagos] = useState<PagoRecurrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchPagos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_PAGOS);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setPagos(data.map(mapApiToPago));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHoy(new Date());
  }, []);

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch(API_SEED, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar datos");
      await fetchPagos();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSeeding(false);
    }
  };

  const pagosOrdenados = useMemo(() => {
    const copia = [...pagos];
    if (orden === "proximo") {
      copia.sort(
        (a, b) =>
          diasFaltantes(a.fechaMaxima, hoy) - diasFaltantes(b.fechaMaxima, hoy)
      );
    } else if (orden === "monto") {
      copia.sort((a, b) => b.monto - a.monto);
    } else {
      copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return copia;
  }, [orden, hoy, pagos]);

  const totalMensual = useMemo(
    () => pagos.reduce((s, p) => s + p.monto, 0),
    [pagos]
  );

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: "var(--savvy-bg)" }}>
      <div className="mx-auto max-w-4xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--savvy-text-primary)] sm:text-3xl">
            Finanzas personales
          </h1>
          <p className="mt-1.5 text-[var(--savvy-text-secondary)]">
            Pagos recurrentes en COP
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className="rounded-[var(--savvy-radius-sm)] border px-4 py-2 text-sm font-medium text-[var(--savvy-text-secondary)]"
              style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg-elevated)" }}
            >
              Hoy: {hoy.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span
              className="rounded-[var(--savvy-radius-sm)] px-4 py-2 text-sm font-semibold"
              style={{ color: "var(--savvy-accent)", background: "var(--savvy-accent-muted)" }}
            >
              Total estimado: {formatearCOP(totalMensual)}
            </span>
          </div>
        </header>

        <section className="space-y-4 pb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--savvy-text-primary)]">
              Próximos pagos{" "}
              <span className="font-normal text-[var(--savvy-text-muted)]">
                ({pagosOrdenados.length})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-[var(--savvy-radius-sm)] p-1"
                style={{ background: "var(--savvy-gray-100)" }}
              >
                {(
                  [
                    { id: "proximo" as const, label: "Por fecha" },
                    { id: "monto" as const, label: "Por monto" },
                    { id: "nombre" as const, label: "Por nombre" },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOrden(id)}
                    className={`rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors ${
                      orden === id
                        ? "text-[var(--savvy-text-primary)] shadow-sm"
                        : "text-[var(--savvy-text-muted)] hover:text-[var(--savvy-text-primary)]"
                    }`}
                    style={orden === id ? { background: "var(--savvy-bg-elevated)" } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!loading && pagos.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="rounded-[var(--savvy-radius-sm)] bg-[var(--savvy-accent)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {seeding ? "Cargando…" : "Cargar datos de ejemplo"}
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--savvy-gray-300)] border-t-[var(--savvy-accent)]"
                aria-hidden
              />
              <p className="text-sm text-[var(--savvy-text-muted)]">
                Cargando pagos…
              </p>
            </div>
          )}

          {error && (
            <div
              className="rounded-[var(--savvy-radius)] border p-4"
              style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg-elevated)" }}
            >
              <p className="text-sm font-medium text-[var(--savvy-text-primary)]">
                {error}
              </p>
              <p className="mt-1 text-xs text-[var(--savvy-text-muted)]">
                Revisa la conexión a la base de datos y que la tabla recurring_payments exista.
              </p>
              <button
                type="button"
                onClick={fetchPagos}
                className="mt-3 rounded-[var(--savvy-radius-sm)] bg-[var(--savvy-accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && pagos.length === 0 && (
            <div
              className="rounded-[var(--savvy-radius)] border py-12 text-center"
              style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg-elevated)" }}
            >
              <p className="text-[var(--savvy-text-secondary)]">
                No hay pagos recurrentes. Usa el botón de arriba para cargar datos de ejemplo.
              </p>
            </div>
          )}

          {!loading && !error && pagos.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-1">
              {pagosOrdenados.map((pago, index) => (
                <li key={pago.id}>
                  <TarjetaPago pago={pago} hoy={hoy} index={index} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
