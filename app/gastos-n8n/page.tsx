"use client";

import { useEffect, useState } from "react";

type ItemGasto = {
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

function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function GastosN8nPage() {
  const [items, setItems] = useState<ItemGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gastos-n8n")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar gastos");
        return res.json();
      })
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 pb-12 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl lg:text-4xl">
            Gastos n8n
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 sm:mt-2 sm:text-base">
            Registros de public.items_gastos (base db_savvy)
          </p>
        </header>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 dark:border-zinc-600 dark:border-t-emerald-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Comprueba que DB_NAME_GASTOS (db_savvy) esté en .env y que la
              tabla public.items_gastos exista.
            </p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              No hay registros en items_gastos.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            {/* Mobile first: tarjetas apiladas */}
            <ul className="flex flex-col gap-3 pb-2 md:hidden">
              {items.map((row) => (
                <li key={row.id}>
                  <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {row.nombre}
                        </h3>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          {row.categoria}
                          <span className="mx-1.5">·</span>
                          {row.cantidad} {row.cantidad === 1 ? "un." : "un."}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatearCOP(Number(row.total))}
                      </p>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <dt>Precio unit.</dt>
                      <dd className="text-right">{formatearCOP(Number(row.precio_unitario))}</dd>
                      <dt>Creado</dt>
                      <dd className="text-right">{formatearFecha(row.created_at)}</dd>
                    </dl>
                  </article>
                </li>
              ))}
            </ul>

            {/* Desktop: tabla */}
            <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        ID
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Nombre
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Categoría
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Cant.
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Precio unit.
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Total
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Moneda
                      </th>
                      <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        Creado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-700"
                      >
                        <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">
                          {row.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {row.nombre}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                          {row.categoria}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                          {row.cantidad}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                          {formatearCOP(Number(row.precio_unitario))}
                        </td>
                        <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                          {formatearCOP(Number(row.total))}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {row.moneda}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {formatearFecha(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
