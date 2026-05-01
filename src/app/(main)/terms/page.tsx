import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-sm leading-relaxed text-muted">
      <h1 className="text-3xl font-semibold text-foreground">Terms of Service</h1>
      <p>
        Last updated April 2026. HarborList is a technology marketplace that connects boat owners with renters.
        These terms govern your use of the website and related services.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">1. Marketplace only</h2>
        <p>
          HarborList does not own, operate, charter, or crew any vessel. Owners are independent third parties.
          We do not guarantee the condition, legality, seaworthiness, or insurance status of any listing. You
          are responsible for your own due diligence before getting underway.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">2. Accounts and eligibility</h2>
        <p>
          You must provide accurate information. Owners who list boats represent that they have authority to
          offer the vessel for rent and that they maintain insurance appropriate for their activities. A
          checkbox attestation is collected at registration or upgrade; it is not a substitute for legal or
          insurance advice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">3. Bookings and payments</h2>
        <p>
          Bookings create a contract directly between renter and owner. Payments are processed by Stripe. A
          platform service fee (shown at checkout) is retained by HarborList. Payout timing and tax reporting
          are your responsibility unless otherwise agreed in writing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">4. Cancellations</h2>
        <p>
          Cancellation policies may be set by individual owners. Unless stated on the listing, HarborList does
          not arbitrate disputes between users.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">5. Conduct and safety</h2>
        <p>
          Users must comply with maritime regulations, carry required safety equipment, and obey local laws.
          HarborList may suspend accounts that appear fraudulent, unsafe, or abusive.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">6. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, HarborList and its affiliates disclaim liability for indirect,
          incidental, or consequential damages arising from use of the platform, including any incident on the
          water.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p>For legal notices, contact the operator of this deployment using the support channels they provide.</p>
      </section>
    </article>
  );
}
