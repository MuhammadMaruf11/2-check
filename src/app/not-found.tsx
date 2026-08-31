import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <span className="font-display text-8xl font-bold text-accent">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 max-w-sm text-foreground-muted">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved, unpublished, or
        never existed.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-soft transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
