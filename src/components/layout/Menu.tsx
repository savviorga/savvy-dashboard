"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Principal",
    items: [
      { href: "/", label: "Inicio", icon: HomeIcon, description: "Página principal" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/home", label: "Pagos recurrentes", icon: ChartIcon, description: "Próximos vencimientos" },
      { href: "/transactions", label: "Transacciones", icon: ReceiptIcon, description: "Listado de movimientos" },
      { href: "/gastos-n8n", label: "Gastos n8n", icon: ReceiptIcon, description: "Items gastos (db_savvy)" },
    ],
  },
];

type MenuProps = {
  onLinkClick?: () => void;
  compact?: boolean;
};

export default function Menu({ onLinkClick, compact = false }: MenuProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 px-3 py-2" aria-label="Navegación principal">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--savvy-text-muted)]">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5" role="list">
            {section.items.map(({ href, label, icon: Icon, description }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onLinkClick}
                    className={`group flex items-center gap-3 rounded-[var(--savvy-radius-sm)] px-3 py-2.5 text-left transition-colors duration-200 ${
                      isActive
                        ? "bg-[var(--savvy-accent-muted)] text-[var(--savvy-accent)]"
                        : "text-[var(--savvy-text-secondary)] hover:bg-[var(--savvy-gray-100)] hover:text-[var(--savvy-text-primary)]"
                    } ${compact ? "py-2" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                        isActive
                          ? "bg-[var(--savvy-accent)]/20 text-[var(--savvy-accent)]"
                          : "bg-[var(--savvy-gray-100)] text-[var(--savvy-text-muted)] group-hover:bg-[var(--savvy-gray-300)] group-hover:text-[var(--savvy-text-primary)]"
                      }`}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{label}</span>
                      {!compact && description && (
                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            isActive
                              ? "text-[var(--savvy-accent)]/90"
                              : "text-[var(--savvy-text-muted)]"
                          }`}
                        >
                          {description}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--savvy-accent)]"
                        aria-hidden
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
