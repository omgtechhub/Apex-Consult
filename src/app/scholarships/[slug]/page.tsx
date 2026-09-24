import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink, CheckCircle, FileText, Clock, Globe, BookOpen } from "lucide-react";
import { getScholarshipBySlug } from "@/lib/scholarships/client";
import {
  formatDegreeLevel,
  formatFundingType,
  formatDeadline,
  formatFieldsOfStudy,
  providerName,
  isDeadlinePassed,
} from "@/lib/scholarships/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScholarshipBySlug(slug);

  if (!s) {
    return { title: "Scholarship Not Found | Apex Academic Consultancy" };
  }

  const seo = s.article?.seo;
  const fallbackDescription = s.description?.substring(0, 160) ?? "";

  return {
    title: seo?.seoTitle ?? `${s.title} | Apex Academic Consultancy`,
    description: seo?.metaDescription ?? fallbackDescription,
    keywords: seo?.keywords,
    alternates: {
      canonical: seo?.canonicalUrl ?? `https://apexacademicconsultancy.com/scholarships/${s.slug}`,
    },
    openGraph: {
      type: "article",
      title: seo?.ogTitle ?? s.title,
      description: seo?.ogDescription ?? fallbackDescription,
      url: `https://apexacademicconsultancy.com/scholarships/${s.slug}`,
      publishedTime: s.article?.publishedAt ?? undefined,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle ?? seo?.ogTitle ?? s.title,
      description: seo?.twitterDescription ?? seo?.ogDescription ?? fallbackDescription,
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const s = await getScholarshipBySlug(slug);

  if (!s) notFound();

  const seo = s.article?.seo;
  const provider = providerName(s.organization);
  const deadlinePassed = isDeadlinePassed(s.deadline);

  return (
    <div className="bg-canvas text-ink-950 min-h-screen pt-24 pb-32">

      {/* ── JSON-LD structured data ─────────────────────────────────── */}
      {seo?.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
        />
      )}
      {seo?.faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.faqSchema) }}
        />
      )}
      {seo?.breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.breadcrumbSchema) }}
        />
      )}

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-4 pt-4 pb-0">
        <ol className="flex items-center gap-2 text-xs text-ink-500">
          <li><Link href="/" className="hover:text-gold-600 transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/scholarships" className="hover:text-gold-600 transition-colors">Scholarships</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink-800 font-medium truncate max-w-[200px]">{s.title}</li>
        </ol>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <section className="py-12 bg-surface border-b border-ink-200/60 mb-12 mt-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {s.country && (
              <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-600 font-semibold text-xs">
                {s.country}
              </span>
            )}
            {s.degreeLevel && s.degreeLevel !== "UNKNOWN" && (
              <span className="px-3 py-1 rounded-full bg-surface border border-ink-200 text-xs">
                {formatDegreeLevel(s.degreeLevel)}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-700 font-bold text-xs">
              {formatFundingType(s.fundingType, s.fundingAmount, s.currency)}
            </span>
            {deadlinePassed && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 font-semibold text-xs">
                Deadline Passed
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display mb-6">{s.title}</h1>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-600">
            {provider !== "Unknown Provider" && (
              <div>
                Provider:{" "}
                {s.organization?.website ? (
                  <a
                    href={s.organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink-950 hover:text-gold-600 transition-colors"
                  >
                    {provider}
                  </a>
                ) : (
                  <strong className="text-ink-950">{provider}</strong>
                )}
              </div>
            )}
            {s.deadline && (
              <div>
                Deadline:{" "}
                <strong className={deadlinePassed ? "text-red-600" : "text-ink-950"}>
                  {formatDeadline(s.deadline)}
                </strong>
              </div>
            )}
            {s.article?.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{s.article.readingTime} min read</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main column ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview */}
            <div className="bg-surface border border-ink-200/60 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-ink-700 leading-relaxed mb-6">
                {s.description ?? "Visit the official portal for full scholarship details."}
              </p>

              {/* Eligibility */}
              {s.eligibility && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Eligibility</h3>
                  <p className="text-ink-700 text-sm leading-relaxed">{s.eligibility}</p>
                </div>
              )}

              {/* Benefits */}
              {s.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {s.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                        <CheckCircle className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {s.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {s.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                        <CheckCircle className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" aria-hidden="true" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {s.documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold-500" aria-hidden="true" />
                    Required Documents
                  </h3>
                  <ul className="space-y-1.5">
                    {s.documents.map((d, i) => (
                      <li key={i} className="text-sm text-ink-700 pl-2 border-l-2 border-gold-500/30">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to apply */}
              {s.applicationInstructions && (
                <div>
                  <h3 className="font-bold mb-2">How to Apply</h3>
                  <p className="text-ink-700 text-sm leading-relaxed">{s.applicationInstructions}</p>
                </div>
              )}
            </div>

            {/* Additional details: fields, eligible countries */}
            {(s.fieldsOfStudy.length > 0 || s.eligibleCountries.length > 0) && (
              <div className="bg-surface border border-ink-200/60 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-4">Additional Details</h2>
                {s.fieldsOfStudy.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gold-500" aria-hidden="true" />
                      Fields of Study
                    </h3>
                    <p className="text-ink-700 text-sm">{formatFieldsOfStudy(s.fieldsOfStudy)}</p>
                  </div>
                )}
                {s.eligibleCountries.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gold-500" aria-hidden="true" />
                      Eligible Countries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {s.eligibleCountries.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 bg-canvas rounded-lg border border-ink-200/60 text-xs text-ink-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Published article content */}
            {s.article?.content && (
              <div className="bg-surface border border-ink-200/60 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-4">
                  {s.article.title ?? "Scholarship Guide"}
                </h2>
                <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed whitespace-pre-line">
                  {s.article.content}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="bg-surface border border-ink-200/80 rounded-3xl p-6 sticky top-28">
              <h3 className="font-bold text-lg mb-2">Apply Now</h3>
              <p className="text-xs text-ink-600 mb-6">
                Visit the official portal or book a guidance session with our experts.
              </p>

              {/* Primary CTA — official portal */}
              {s.officialUrl && (
                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gold-500 text-white font-semibold text-sm rounded-xl mb-3 hover:bg-gold-600 transition-colors"
                >
                  Official Portal <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}

              {/* Secondary CTA — separate application portal if different from official */}
              {s.applicationUrl && s.applicationUrl !== s.officialUrl && (
                <a
                  href={s.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gold-500 text-gold-700 font-semibold text-sm rounded-xl mb-3 hover:bg-gold-500/10 transition-colors"
                >
                  Apply Online <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}

              {/* Guidance booking */}
              <Link
                href="/book"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-ink-200 text-ink-950 font-semibold text-sm rounded-xl hover:bg-ink-100 transition-colors"
              >
                Get Expert Guidance <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {/* Quick-reference metadata */}
              <ul className="mt-6 space-y-3 text-xs text-ink-600 border-t border-ink-200/60 pt-4">
                {s.degreeLevel && s.degreeLevel !== "UNKNOWN" && (
                  <li className="flex justify-between">
                    <span>Level</span>
                    <span className="font-semibold text-ink-950">{formatDegreeLevel(s.degreeLevel)}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>Funding</span>
                  <span className="font-semibold text-ink-950 text-right max-w-[140px]">
                    {formatFundingType(s.fundingType, s.fundingAmount, s.currency)}
                  </span>
                </li>
                {s.country && (
                  <li className="flex justify-between">
                    <span>Host Country</span>
                    <span className="font-semibold text-ink-950">{s.country}</span>
                  </li>
                )}
                {s.deadline && (
                  <li className="flex justify-between">
                    <span>Deadline</span>
                    <span className={`font-semibold text-right max-w-[140px] ${deadlinePassed ? "text-red-600" : "text-ink-950"}`}>
                      {formatDeadline(s.deadline)}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
