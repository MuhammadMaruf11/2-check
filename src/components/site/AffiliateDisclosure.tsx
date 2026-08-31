export default function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <p className={compact ? "text-xs text-foreground-muted" : "rounded-md bg-accent-soft px-4 py-3 text-sm text-accent-strong"}>
      Some links on this page are affiliate links. If you buy through them, TechToCheck may earn a
      commission at no additional cost to you. This never affects our editorial verdict.
    </p>
  );
}
