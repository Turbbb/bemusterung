interface SiteHeaderProps {
  projectName: string;
}

const LogoMark = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
    <rect x="1.5" y="1.5" width="37" height="37" rx="10" className="fill-primary" />
    <path
      d="M12 30V10h10a6 6 0 0 1 0 12H12m10 0 7 8"
      fill="none"
      className="stroke-primary-foreground"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SiteHeader = ({ projectName }: SiteHeaderProps) => (
  <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <LogoMark />
        <span className="font-serif text-xl font-medium tracking-tight">Raumwerk</span>
      </div>
      <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {projectName}
      </span>
    </div>
  </header>
);

export default SiteHeader;
