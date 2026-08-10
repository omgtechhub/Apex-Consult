import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Cookie Policy | Apex Academic Consultancy",
};

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy">
      <LegalSection heading="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit our website.
          They help us improve your experience and analyze how our site is used.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use Cookies">
        <ul className="list-disc list-inside space-y-1">
          <li>Essential cookies for site functionality</li>
          <li>Analytics cookies to understand usage patterns</li>
          <li>Preference cookies to remember your settings</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Managing Cookies">
        <p>
          You can control and delete cookies through your browser settings. Note that
          disabling certain cookies may affect site functionality.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
