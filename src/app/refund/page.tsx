import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Refund Policy | Altivance Academic Consultancy",
};

export default function RefundPage() {
  return (
    <LegalShell title="Refund Policy">
      <LegalSection heading="Our Satisfaction Guarantee">
        <p>
          We offer unlimited revisions until you are 100% satisfied with your work. If we
          cannot meet your stated requirements after reasonable revision attempts, we will
          issue a full refund.
        </p>
      </LegalSection>

      <LegalSection heading="Eligible Refund Scenarios">
        <ul className="list-disc list-inside space-y-1">
          <li>Work is significantly different from the agreed brief</li>
          <li>Work is delivered after the agreed deadline (without client-requested extension)</li>
          <li>Plagiarism detected in delivered work (we provide plagiarism-free guarantee)</li>
          <li>Cancellation before work has begun</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Non-Refundable Scenarios">
        <ul className="list-disc list-inside space-y-1">
          <li>Client changes requirements after work has been completed</li>
          <li>Work has been submitted to institution and grade received</li>
          <li>More than 14 days after delivery without raising a complaint</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Refund Process">
        <p>
          Contact us at{" "}
          <a
            href="mailto:info@altivance.com"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            info@altivance.com
          </a>{" "}
          or WhatsApp{" "}
          <a
            href="https://wa.me/2347084321204"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            +234 708 432 1204
          </a>{" "}
          within 14 days of delivery. Refunds are processed within 5-7 business days to your
          original payment method.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
