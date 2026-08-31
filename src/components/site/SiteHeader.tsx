"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SearchOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/products", label: "Reviews" },
  { href: "/blog", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const accountHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "AUTHOR"
        ? "/author"
        : "/user";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="logo" width={150} height={84} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname.startsWith(link.href) ? "text-white" : "text-white/65",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="text-white hover:text-accent transition-colors"
          >
            <SearchOutlined style={{ fontSize: 18 }} />
          </Link>
          {session ? (
            <Link
              href={accountHref}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft transition-colors"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <CloseOutlined style={{ fontSize: 20 }} />
          ) : (
            <MenuOutlined style={{ fontSize: 20 }} />
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-paper px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="text-sm font-medium text-foreground"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>
          <Link
            href={session ? accountHref : "/login"}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white text-center"
            onClick={() => setOpen(false)}
          >
            {session ? "My Account" : "Sign In"}
          </Link>
        </div>
      )}
    </header>
  );
}
