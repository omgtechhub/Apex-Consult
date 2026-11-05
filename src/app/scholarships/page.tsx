import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { getScholarships } from "@/lib/scholarships/client";
import {
  formatDegreeLevel,
  formatFundingType,
  formatDeadline,
  providerName,
  isDeadlinePassed,
} from "@/lib/scholarships/utils";
import type { DegreeLevel, FundingType } from "@/lib/scholarships/types";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Global Scholarships Directory",
  description:
    "Browse fully-funded, partial, and tuition-only international scholarships for undergraduate, master's, and PhD students. Verified opportunities curated by Altivance Academic Consultancy.",
  openGraph: {
    title: "Global Scholarships Directory | Altivance Academic Consultancy",
    description:
      "Browse verified international scholarships — Chevening, Commonwealth, Fulbright, and more.",
    url: absoluteUrl("/scholarships"),
  },
};

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    country?: string;
    degreeLevel?: string;
    fundingType?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const country = params.country ?? "";
  // Cast to typed enums (empty string means "no filter" — getScholarships handles that)
  const degreeLevel = (params.degreeLevel ?? "") as DegreeLevel | "";
  const fundingType = (params.fundingType ?? "") as FundingType | "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const data = await getScholarships({
    search: search || undefined,
    country: country || undefined,
    degreeLevel: degreeLevel || undefined,
    fundingType: fundingType || undefined,
    page,
    limit: 12,
  });
  const { scholarships, totalPages, total } = data;

  const buildQuery = (p: number) => {
    const qp = new URLSearchParams();
    if (search) qp.set("search", search);
    if (country) qp.set("country", country);
    if (degreeLevel) qp.set("degreeLevel", degreeLevel);
    if (fundingType) qp.set("fundingType", fundingType);
    qp.set("page", p.toString());
    return `/scholarships?${qp.toString()}`;
  };

  const hasFilters = !!(search || country || degreeLevel || fundingType);

  return (
    <div className="bg-canvas text-ink-950 min-h-screen pt-24 pb-32">
      {/* ── Hero / filters ─────────────────────────────────────────────── */}
      <section className="py-16 bg-surface border-b border-ink-200/60 mb-12">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-4xl font-black font-display mb-4">Discover Scholarships</h1>
          <p className="text-ink-600 mb-8">
            Search verified undergraduate, master&apos;s, and PhD funding opportunities.
          </p>

          <form
            method="GET"
            action="/scholarships"
            className="max-w-4xl mx-auto bg-canvas p-4 rounded-2xl border border-ink-200 flex flex-wrap gap-3"
          >
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search scholarships..."
                className="w-full px-4 py-2.5 bg-surface border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                aria-label="Search scholarships by name or description"
              />
            </div>

            {/* Country */}
            <div className="w-full sm:w-36">
              <input
                type="text"
                name="country"
                defaultValue={country}
                placeholder="Country"
                className="w-full px-4 py-2.5 bg-surface border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                aria-label="Filter by host country"
              />
            </div>

            {/* Degree level — values are Prisma enum identifiers (backend exact-matches them) */}
            <div className="w-full sm:w-44">
              <select
                name="degreeLevel"
                defaultValue={degreeLevel}
                aria-label="Filter by degree level"
                className="w-full px-4 py-2.5 bg-surface border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Degree Levels</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="MASTERS">Master&apos;s</option>
                <option value="PHD">PhD</option>
                <option value="POSTDOCTORAL">Postdoctoral</option>
                <option value="SHORT_COURSE">Short Course</option>
                <option value="ONLINE">Online</option>
                <option value="ANY">Any Level</option>
              </select>
            </div>

            {/* Funding type — values are Prisma enum identifiers */}
            <div className="w-full sm:w-44">
              <select
                name="fundingType"
                defaultValue={fundingType}
                aria-label="Filter by funding type"
                className="w-full px-4 py-2.5 bg-surface border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Funding Types</option>
                <option value="FULL">Fully Funded</option>
                <option value="PARTIAL">Partial Funding</option>
                <option value="TUITION_ONLY">Tuition Only</option>
                <option value="LIVING_ALLOWANCE">Living Allowance</option>
                <option value="TRAVEL">Travel Grant</option>
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-brand-500 text-on-brand font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
              >
                Filter
              </button>
              {hasFilters && (
                <Link
                  href="/scholarships"
                  className="px-4 py-2.5 border border-ink-200 text-ink-700 font-medium text-sm rounded-xl hover:bg-surface transition-colors flex items-center justify-center"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4">
        {scholarships.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-surface rounded-3xl border border-ink-200/60 max-w-2xl mx-auto p-8">
            <GraduationCap className="w-12 h-12 text-brand-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2">No scholarships found</h3>
            <p className="text-ink-600 text-sm mb-6">
              Try broadening your search query or resetting your filters to see available
              opportunities.
            </p>
            <Link
              href="/scholarships"
              className="inline-block px-6 py-2.5 bg-brand-500 text-on-brand font-semibold text-sm rounded-xl"
            >
              Reset all filters
            </Link>
          </div>
        ) : (
          <>
            {/* Count / page indicator */}
            <div className="flex justify-between items-center mb-6 text-sm text-ink-600">
              <span>
                Showing {scholarships.length} of {total} scholarship
                {total !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <span>
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            {/* Scholarship cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {scholarships.map((s) => {
                const passed = isDeadlinePassed(s.deadline);
                return (
                  <div
                    key={s.id}
                    className="bg-surface border border-ink-200/60 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/30 hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {s.country && (
                          <span className="text-xs font-bold text-brand-600 bg-brand-500/10 px-2.5 py-1 rounded-lg">
                            {s.country}
                          </span>
                        )}
                        {s.degreeLevel && s.degreeLevel !== "UNKNOWN" && (
                          <span className="text-xs text-ink-500 bg-canvas px-2.5 py-1 rounded-lg border border-ink-200/60">
                            {formatDegreeLevel(s.degreeLevel)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-2 text-ink-950 hover:text-brand-600 transition-colors">
                        <Link href={`/scholarships/${s.slug}`}>{s.title}</Link>
                      </h3>

                      <p className="text-ink-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {s.description ?? "Details available on the scholarship page."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-ink-200/40">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-semibold text-brand-600">
                          {formatFundingType(s.fundingType, s.fundingAmount, s.currency)}
                        </span>
                        <Link
                          href={`/scholarships/${s.slug}`}
                          className="text-ink-950 font-semibold flex items-center gap-1 hover:text-brand-600 transition-colors"
                          aria-label={`View details for ${s.title}`}
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                        </Link>
                      </div>
                      {s.deadline && (
                        <p className={`text-xs ${passed ? "text-red-500" : "text-ink-500"}`}>
                          {passed ? "Deadline passed: " : "Deadline: "}
                          {formatDeadline(s.deadline)}
                        </p>
                      )}
                      {providerName(s.organization) !== "Unknown Provider" && (
                        <p className="text-xs text-ink-400 mt-1 truncate">
                          {providerName(s.organization)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Scholarship pagination"
                className="flex items-center justify-center gap-2 pt-8 border-t border-ink-200/60"
              >
                {page > 1 ? (
                  <Link
                    href={buildQuery(page - 1)}
                    className="p-2.5 border border-ink-200 rounded-xl text-ink-700 hover:bg-surface transition-colors flex items-center justify-center"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <span
                    className="p-2.5 border border-ink-200/40 rounded-xl text-ink-300 cursor-not-allowed flex items-center justify-center"
                    aria-disabled="true"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildQuery(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                      p === page
                        ? "bg-brand-500 text-white"
                        : "border border-ink-200 text-ink-700 hover:bg-surface"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {page < totalPages ? (
                  <Link
                    href={buildQuery(page + 1)}
                    className="p-2.5 border border-ink-200 rounded-xl text-ink-700 hover:bg-surface transition-colors flex items-center justify-center"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span
                    className="p-2.5 border border-ink-200/40 rounded-xl text-ink-300 cursor-not-allowed flex items-center justify-center"
                    aria-disabled="true"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
