"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  account: string;
  description: string | null;
};

function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearFecha(dateStr: string): string {
  const d = dateStr.slice(0, 10);
  if (!d) return dateStr;
  return new Date(d + "T12:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar transacciones");
        return res.json();
      })
      .then(setTransactions)
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Transacciones
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Listado de movimientos ordenados por id
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
              Comprueba que la tabla public.transactions exista en la base de
              datos.
            </p>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              No hay transacciones.
            </p>
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      Fecha
                    </th>
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      Tipo
                    </th>
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      Monto
                    </th>
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      Categoría
                    </th>
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const amount = Number(t.amount);
                    const isEgreso = t.type === "egreso" || amount < 0;
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-700"
                      >
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {formatearFecha(t.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              isEgreso
                                ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            isEgreso
                              ? "text-red-600 dark:text-red-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatearCOP(amount)}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                          {t.category}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {t.description ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
