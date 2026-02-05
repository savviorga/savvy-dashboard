export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t text-sm text-[var(--savvy-text-muted)]"
      style={{ borderColor: "var(--savvy-border)", background: "var(--savvy-bg)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
        <p>© {year} savvy</p>
        <p className="hidden sm:block" aria-hidden>·</p>
        <p>Claridad y control sobre tu dinero</p>
      </div>
    </footer>
  );
}
