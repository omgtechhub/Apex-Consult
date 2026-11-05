import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <LegalSection heading="1. Information We Collect">
        <p>
          We collect information you provide directly to us, including name, email address,
          phone number, and any content you submit through our forms. We also collect
          information about how you use our website through cookies and analytics tools.
        </p>
      </LegalSection>

      <LegalSection heading="2. How We Use Your Information">
        <p>
          We use the information we collect to provide and improve our services, communicate
          with you about bookings and inquiries, send relevant newsletters (with your consent),
          and comply with legal obligations. We never sell your personal information to third parties.
        </p>
      </LegalSection>

      <LegalSection heading="3. Information Sharing">
        <p>
          We do not share your personal information with third parties except as necessary
          to provide our services (e.g., payment processors) or as required by law. All
          team members who handle client data sign strict confidentiality agreements.
        </p>
      </LegalSection>

      <LegalSection heading="4. Data Security">
        <p>
          We implement appropriate security measures to protect your information against
          unauthorized access, alteration, disclosure, or destruction. Your academic
          work and personal details are treated with the highest level of confidentiality.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your Rights">
        <p>
          You have the right to access, correct, or delete your personal information at
          any time. You can opt out of marketing communications. Contact us at{" "}
          <a
            href="mailto:info@altivance.com"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            info@altivance.com
          </a>{" "}
          to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us at:
          <br />
          Email:{" "}
          <a
            href="mailto:info@altivance.com"
            className="text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            info@altivance.com
          </a>
          <br />
          WhatsApp:{" "}
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
