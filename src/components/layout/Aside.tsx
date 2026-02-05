import Menu from "./Menu";

type AsideProps = {
  onLinkClick?: () => void;
};

export default function Aside({ onLinkClick }: AsideProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 md:block">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto py-4">
        <Menu onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
}
