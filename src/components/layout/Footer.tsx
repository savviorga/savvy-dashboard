export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:px-6">
        <p>© {year} Savvy Dashboard. Finanzas personales.</p>
        <p className="hidden sm:block">·</p>
        <p>Datos de ejemplo en COP</p>
      </div>
    </footer>
  );
}
