import { Metadata } from "next";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about TechToCheck's mission of honest, independent technology reviews.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">About TechToCheck</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Technology worth your attention.</h1>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground-muted">
          <p>
            TechToCheck was built on a simple idea: technology reviews should help you decide, not sell you
            something. We buy the products we test, run them through real-world use, and publish our honest
            verdict — good, bad, or somewhere in between.
          </p>
          <p>
            Our team combines hands-on testing with data from customer reviews and recognized industry
            experts to give you the fullest possible picture before you spend your money. When a product has
            multiple buying options, we show them all, so you can pick the best deal wherever you shop.
          </p>
          <p>
            We&apos;re independent and international. Our readers come from every corner of the world, and our
            reviews are written with that global audience in mind — not tied to a single country&apos;s
            retailers, currencies, or brands.
          </p>
          <p>
            Some of the links on our site are affiliate links, and we may earn a commission if you buy through
            them. This never influences our verdict — you can read our full{" "}
            <a href="/affiliate-disclosure" className="text-accent underline">
              affiliate disclosure
            </a>{" "}
            for details.
          </p>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "We test", desc: "Every review starts with real, hands-on use of the product." },
            { label: "We compare", desc: "We weigh every product against real alternatives, not in isolation." },
            { label: "You decide", desc: "We give you the facts and our honest take — the choice is yours." },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-surface p-6">
              <p className="font-display text-lg font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-sm text-foreground-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
