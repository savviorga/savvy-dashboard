"use client";

import Link from "next/link";

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Menú hamburguesa: solo móvil */}
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:hidden"
          aria-label="Abrir menú"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <span className="text-xl">💰</span>
          <span className="truncate">Savvy Dashboard</span>
        </Link>

        {/* Nav desktop: oculto en móvil, visible desde md */}
        <nav className="ml-auto hidden items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            Inicio
          </Link>
          <Link
            href="/home"
            className="rounded-md px-3 py-2 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            Finanzas
          </Link>
        </nav>
      </div>
    </header>
  );
}
