import Link from "next/link";

/**
 * /legal/* shared shell — slim header + dark page background shared by the
 * Privacy Policy and Terms of Service pages. The legal copy itself is
 * English-only and lives in each page file.
 */
export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-bg-page text-primary-text">
      <header className="border-b border-divider">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-primary-text transition-colors hover:text-primary"
          >
            Sceneviz
          </Link>
          <Link
            href="/"
            className="rounded text-sm text-secondary-text transition-colors hover:text-primary-text"
          >
            &larr; Back to Sceneviz
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-10">{children}</main>
      <footer className="border-t border-divider">
        <div className="mx-auto max-w-3xl px-6 py-6 text-xs text-secondary-text">
          &copy; 2026 Opraiz Technology Pvt Ltd &middot;{" "}
          <a
            href="mailto:support@opraiz.com"
            className="text-primary transition-colors hover:underline"
          >
            support@opraiz.com
          </a>
        </div>
      </footer>
    </div>
  );
}
