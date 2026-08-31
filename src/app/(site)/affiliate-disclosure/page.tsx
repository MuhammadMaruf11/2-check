import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How TechToCheck's affiliate links work and why they don't affect our reviews.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Affiliate Disclosure</h1>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground-muted">
        <p>
          Some links on TechToCheck may be affiliate links. If you purchase through them, we may earn a
          commission at no additional cost to you.
        </p>
        <p>
          When we review a product, we list every buying option we can find — often across multiple
          retailers — so you can compare prices and pick whichever works best for you. Some, but not all, of
          those links are affiliate links.
        </p>
        <p>
          Our editorial verdict is never influenced by whether a retailer offers an affiliate commission.
          Products are rated the same way whether or not we earn anything from a sale, and we don&apos;t
          accept payment from brands in exchange for a positive review.
        </p>
        <p>
          Affiliate commissions help fund the cost of buying and testing the products we review. Thank you
          for supporting independent tech journalism.
        </p>
      </div>
    </div>
  );
}
