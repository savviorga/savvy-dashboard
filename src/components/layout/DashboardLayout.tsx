"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Aside from "./Aside";
import Footer from "./Footer";
import Header from "./Header";
import Menu from "./Menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Drawer móvil: overlay + panel */}
      <div
        className="fixed inset-0 z-50 md:hidden"
        aria-hidden={!mobileMenuOpen}
        style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
      >
        <div
          className={`absolute inset-0 bg-[var(--savvy-primary)]/40 transition-opacity duration-200 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r shadow-xl transition-transform duration-200 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            borderColor: "var(--savvy-border)",
            background: "var(--savvy-bg-elevated)",
          }}
        >
          <div
            className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4"
            style={{ borderColor: "var(--savvy-border)" }}
          >
            <span className="flex items-center gap-2 font-semibold text-[var(--savvy-text-primary)]">
              <span className="text-lg lowercase">savvy</span>
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-[var(--savvy-radius-sm)] text-[var(--savvy-text-secondary)] transition-colors hover:bg-[var(--savvy-gray-100)] hover:text-[var(--savvy-text-primary)]"
              aria-label="Cerrar menú"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <Menu onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <Aside />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

