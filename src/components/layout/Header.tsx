"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const USER_NAME = "John Doe";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/home", label: "Pagos recurrentes" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/gastos-n8n", label: "Gastos n8n" },
] as const;

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--savvy-border)",
        background: "var(--savvy-bg-elevated)",
        boxShadow: "0 1px 0 var(--savvy-border)",
      }}
    >
      <div className="flex h-16 items-center gap-6 px-4 sm:gap-8 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--savvy-radius-sm)] text-[var(--savvy-text-secondary)] transition-colors hover:bg-[var(--savvy-gray-100)] hover:text-[var(--savvy-text-primary)] md:hidden"
          aria-label="Abrir menú"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-[12px] transition-transform hover:scale-105"
            style={{ background: "var(--savvy-accent-muted)" }}
            aria-hidden
          >
            <svg
              className="h-5 w-5"
              style={{ color: "var(--savvy-accent)" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
          <span className="text-xl font-semibold lowercase tracking-tight text-[var(--savvy-text-primary)]">
            savvy
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label="Principal">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-[var(--savvy-radius-sm)] px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--savvy-text-primary)]"
                    : "text-[var(--savvy-text-secondary)] hover:bg-[var(--savvy-gray-100)] hover:text-[var(--savvy-text-primary)]"
                }`}
                style={
                  isActive
                    ? { background: "var(--savvy-gray-100)" }
                    : undefined
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div
            className="flex items-center gap-3 rounded-[var(--savvy-radius-sm)] border pl-1 pr-3 py-1.5"
            style={{
              borderColor: "var(--savvy-border)",
              background: "var(--savvy-bg)",
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: "var(--savvy-accent)" }}
              aria-hidden
            >
              {USER_NAME.split(" ").map((n) => n[0]).join("")}
            </span>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-[var(--savvy-text-primary)] sm:block">
              {USER_NAME}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
