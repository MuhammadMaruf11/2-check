import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TechToCheck collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-foreground-muted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

      <div className="mt-10 space-y-8 text-foreground-muted leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Information We Collect</h2>
          <p className="mt-3">
            When you create an account, subscribe to our newsletter, submit a product review, post a
            comment, or contact us, we collect the information you provide — such as your name, email
            address, and the content of your submission. We also collect basic usage data (pages visited,
            general location, device type) to help us improve the site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">How We Use Your Information</h2>
          <p className="mt-3">
            We use your information to operate TechToCheck: to authenticate your account, display your
            reviews and comments, send newsletter emails you&apos;ve subscribed to, respond to contact
            messages, and understand how visitors use the site so we can improve it. We do not sell your
            personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Cookies</h2>
          <p className="mt-3">
            We use cookies to keep you signed in and to remember basic preferences. You can disable cookies
            in your browser settings, though some features of the site may not work correctly without them.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Affiliate Links</h2>
          <p className="mt-3">
            Some links on TechToCheck are affiliate links to third-party retailers. If you click through and
            make a purchase, we may earn a commission. These retailers have their own privacy policies
            governing any information you provide to them directly.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Your Rights</h2>
          <p className="mt-3">
            You may request access to, correction of, or deletion of your personal data at any time by
            contacting us. You can unsubscribe from our newsletter using the link in any email we send.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Contact Us</h2>
          <p className="mt-3">
            If you have questions about this policy, please reach out via our{" "}
            <a href="/contact" className="text-accent underline">contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
