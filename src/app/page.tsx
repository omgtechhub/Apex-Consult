import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { TrustSection } from "@/components/home/TrustSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { MarqueeStrip } from "@/components/home/MarqueeStrip";

export const metadata: Metadata = {
  title: "Apex Academic Consultancy | Where Academic Excellence Meets Results",
  description:
    "Nigeria's #1 academic consultancy. Expert project writing, data analysis, study abroad guidance, and more. 5,000+ students served. Book your free consultation today.",
};

export default function HomePage() {
  return (
    <>
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Apex Academic Consultancy",
            description: "Where Academic Excellence Meets Results",
            url: "https://apexacademicconsultancy.com",
            mainEntity: {
              "@type": "EducationalOrganization",
              name: "Apex Academic Consultancy",
              offers: [
                { "@type": "Offer", name: "Project Writing" },
                { "@type": "Offer", name: "Research Assistance" },
                { "@type": "Offer", name: "Data Analysis" },
                { "@type": "Offer", name: "Study Abroad Consultancy" },
              ],
            },
          }),
        }}
      />

      <HeroSection />
      <MarqueeStrip />
      <ServicesOverview />
      <TrustSection />
      <ProcessSection />
      <TestimonialsSection />
      <FAQPreview />
      <CTASection />
    </>
  );
}
