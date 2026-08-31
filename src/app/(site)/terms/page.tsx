import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of TechToCheck.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-foreground-muted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

      <div className="mt-10 space-y-8 text-foreground-muted leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Acceptance of Terms</h2>
          <p className="mt-3">
            By accessing or using TechToCheck, you agree to be bound by these terms. If you do not agree,
            please do not use the site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Content and Reviews</h2>
          <p className="mt-3">
            Our product reviews, ratings, and articles reflect our editorial opinion at the time of
            publication and are provided for informational purposes only. Specifications, prices, and
            availability shown on the site may change and are not guaranteed to be current — always confirm
            final details with the retailer before purchasing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">User-Submitted Content</h2>
          <p className="mt-3">
            If you submit a review, comment, or article as an author, you retain ownership of your content
            but grant TechToCheck a license to display, edit for clarity, and moderate it. Content that is
            abusive, spam, or otherwise violates community guidelines may be removed or hidden at our
            discretion.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Affiliate Relationships</h2>
          <p className="mt-3">
            TechToCheck participates in affiliate programs with various retailers. We may earn a commission
            on qualifying purchases made through links on our site, at no additional cost to you. See our{" "}
            <a href="/affiliate-disclosure" className="text-accent underline">affiliate disclosure</a> for
            details.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Limitation of Liability</h2>
          <p className="mt-3">
            TechToCheck is not liable for any damages arising from your use of the site or reliance on our
            content, including purchase decisions made based on our reviews.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Changes to These Terms</h2>
          <p className="mt-3">
            We may update these terms from time to time. Continued use of the site after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
