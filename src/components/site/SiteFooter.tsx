import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import Image from "next/image";

const columns = [
  {
    title: "Reviews",
    links: [
      { href: "/products", label: "All Reviews" },
      { href: "/products?sort=rating", label: "Top Rated" },
      { href: "/products?featured=true", label: "Editor's Picks" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Articles" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="logo"
                width={150}
                height={84}
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm text-white/60">
              We test. We compare. You decide. Independent technology reviews,
              honest verdicts, and buying guides for a global audience.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-white/80">
                Get our weekly verdict
              </p>
              <NewsletterForm dark />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} TechToCheck. All rights reserved.
          </p>
          <p className="max-w-xl text-xs text-white/40">
            Some links on TechToCheck may be affiliate links. If you purchase
            through them, we may earn a commission at no additional cost to you.{" "}
            <Link
              href="/affiliate-disclosure"
              className="underline hover:text-white/70"
            >
              Learn more
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
