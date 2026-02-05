import Menu from "./Menu";

type AsideProps = {
  onLinkClick?: () => void;
};

export default function Aside({ onLinkClick }: AsideProps) {
  return (
    <aside
      className="hidden w-64 shrink-0 border-r md:block"
      style={{
        borderColor: "var(--savvy-border)",
        background: "var(--savvy-bg-elevated)",
      }}
    >
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-y-auto py-5">
        <Menu onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
}
