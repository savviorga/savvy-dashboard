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
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">
          Días faltantes
        </span>
        <span
          className={
            urgente
              ? "font-semibold text-red-600 dark:text-red-400"
              : pronto
                ? "font-semibold text-amber-600 dark:text-amber-400"
                : "font-semibold text-emerald-600 dark:text-emerald-400"
          }
        >
          {diasRestantes === 0
            ? "Vence hoy"
            : diasRestantes < 0
              ? "Vencido"
              : `${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            urgente
              ? "bg-red-500"
              : pronto
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{
            width: `${porcentaje}%`,
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

  return (
    <article
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800/50"
      style={{
        animation: "fade-in 0.4s ease-out forwards",
        animationDelay: `${index * 60}ms`,
        opacity: 0,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-700">
          {pago.icono}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {pago.nombre}
            </h3>
            {pago.proveedor && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                {pago.proveedor}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {formatearCOP(pago.monto)}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Finanzas personales
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Pagos recurrentes en pesos colombianos (COP)
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-sm dark:bg-zinc-800">
              Hoy: {hoy.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Total estimado: {formatearCOP(totalMensual)}
            </span>
          </div>
        </header>

        <section className="space-y-4 pb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Próximos pagos{" "}
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                ({pagosOrdenados.length})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
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
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      orden === id
                        ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
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
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {seeding ? "Cargando…" : "Cargar datos de ejemplo"}
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 dark:border-zinc-600 dark:border-t-emerald-500" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Cargando pagos…
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Comprueba que la conexión a la base de datos (DB_* o DATABASE_URL) esté en .env y que
                la tabla recurring_payments exista.
              </p>
              <button
                type="button"
                onClick={fetchPagos}
                className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && pagos.length === 0 && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-zinc-600 dark:text-zinc-400">
                No hay pagos recurrentes. Carga datos de ejemplo con el botón de
                arriba para insertar los datos de ejemplo.
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
