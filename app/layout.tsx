import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DashboardLayout } from "@/src/components/layout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "savvy — Finanzas personales",
  description: "Claridad y control sobre tu dinero, sin estrés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
