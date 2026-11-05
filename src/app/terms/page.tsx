import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service | Altivance Academic Consultancy",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service">
      <LegalSection heading="1. Services">
        <p>
          Altivance Academic Consultancy provides academic writing, editing, research assistance,
          and consulting services. All services are intended for educational and research
          purposes. Clients are responsible for ensuring their use of our services complies
          with their institution&apos;s academic integrity policies.
        </p>
      </LegalSection>

      <LegalSection heading="2. Payment Terms">
        <p>
          Payment is required before work begins or as agreed in installments. Payments
          are processed by Paystack, our payment gateway, which accepts card, bank
          transfer, USSD and mobile money; direct bank transfer is also available. All
          prices are in Nigerian Naira (₦) unless otherwise stated. Prices may vary based
          on project complexity and urgency.
        </p>
      </LegalSection>

      <LegalSection heading="3. Revisions & Refunds">
        <p>
          We offer unlimited revisions within the agreed scope of work. If we are unable
          to meet your requirements after reasonable revision attempts, we will issue a
          full refund. Rush refund requests may be subject to a processing fee.
        </p>
      </LegalSection>

      <LegalSection heading="4. Confidentiality">
        <p>
          We treat all client information and submitted work with strict confidentiality.
          We will not share your personal information or academic work with third parties
          without your explicit consent.
        </p>
      </LegalSection>

      <LegalSection heading="5. Intellectual Property">
        <p>
          Upon full payment, ownership of all work product transfers to the client.
          Altivance Academic Consultancy retains no rights to the completed work.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact">
        <p>
          For questions about these terms:{" "}
          <a
            href="mailto:info@altivance.com"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            info@altivance.com
          </a>{" "}
          |{" "}
          <a
            href="https://wa.me/2347084321204"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            +234 708 432 1204
          </a>
        </p>
      </LegalSection>
    </LegalShell>
  );
}
