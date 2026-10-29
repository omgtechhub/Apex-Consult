import "server-only";
import {
  Scholarship,
  ScholarshipSummary,
  ScholarshipsResponse,
  ScholarshipQueryParams,
  ApiEnvelope,
  ScholarshipsListPayload,
} from "./types";

const SCHOLARSHIP_API_URL =
  process.env.SCHOLARSHIP_API_URL || "https://apex-scholarship-api.onrender.com";

/**
 * Hard ceiling on how long a visitor waits for the Pipeline API.
 *
 * Without this, `fetch` has no timeout at all: a sleeping free-tier instance
 * left the scholarships page hanging for ~65s on the first request after idle,
 * and because nothing threw, the fallback below never engaged. Eight seconds
 * is comfortably above a warm response (~300ms local, ~5s warm remote) and far
 * below what anyone will sit through.
 */
const REQUEST_TIMEOUT_MS = 8_000;

/**
 * `AbortSignal.timeout` is the whole reason the fallback can ever fire on a
 * hang — see REQUEST_TIMEOUT_MS. Guarded because it is a relatively recent
 * addition; on a runtime without it we simply fetch untimed rather than crash.
 */
function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
    ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    : undefined;
}

// ─── Fallback dataset ─────────────────────────────────────────────────────────
// Used when the Pipeline API is unreachable. Field names exactly mirror the
// backend API response shape so the same components render both paths.

export const FALLBACK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "chevening-2025",
    slug: "chevening-scholarship-guide",
    title: "Chevening Scholarship",
    description:
      "Chevening Scholarships are the UK Government's global scholarship programme, funded by the Foreign, Commonwealth & Development Office and partner organisations. They offer fully-funded one-year master's degrees at UK universities.",
    organization: {
      name: "UK Foreign, Commonwealth & Development Office (FCDO)",
      website: "https://www.chevening.org",
      country: "UK",
      description: null,
    },
    country: "UK",
    eligibleCountries: [],
    degreeLevel: "MASTERS",
    fieldsOfStudy: [],
    fundingType: "FULL",
    fundingAmount: null,
    currency: null,
    benefits: [
      "Full university tuition fees",
      "Monthly living stipend",
      "Economy class return flights to the UK",
      "Additional grants for essential expenditure",
    ],
    deadline: null,
    officialUrl: "https://www.chevening.org/apply/",
    applicationUrl: "https://www.chevening.org/apply/",
    eligibility:
      "Be a citizen of a Chevening-eligible country, agree to return to your home country for a minimum of two years after your award has ended, and hold an undergraduate degree.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Applications must be submitted via the official Chevening online application portal before the annual deadline.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "commonwealth-2025",
    slug: "commonwealth-scholarship-guide",
    title: "Commonwealth Scholarship",
    description:
      "Commonwealth Scholarships are aimed at individuals who could not otherwise afford to study in the UK, enabling talented individuals to gain skills required for sustainable development.",
    organization: {
      name: "Commonwealth Scholarship Commission (CSC)",
      website: "https://cscuk.fcdo.gov.uk",
      country: "UK",
      description: null,
    },
    country: "UK",
    eligibleCountries: [],
    degreeLevel: "MASTERS",
    fieldsOfStudy: ["Development-focused fields"],
    fundingType: "FULL",
    fundingAmount: null,
    currency: null,
    benefits: [
      "Approved tuition fees",
      "Stipend (living allowance)",
      "Return airfare to the UK",
      "Warm clothing allowance where applicable",
    ],
    deadline: null,
    officialUrl: "https://cscuk.fcdo.gov.uk/scholarships/",
    applicationUrl: "https://cscuk.fcdo.gov.uk/scholarships/",
    eligibility:
      "Be a citizen or permanent resident of an eligible Commonwealth country, hold a first degree of at least upper second class (2:1) honours standard.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Apply through the CSC online application system as well as your national nominating agency.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fulbright-2025",
    slug: "fulbright-foreign-student-program",
    title: "Fulbright Foreign Student Program",
    description:
      "The Fulbright Foreign Student Program enables graduate students, young professionals, and artists from abroad to study and conduct research in the United States.",
    organization: {
      name: "U.S. Department of State",
      website: "https://foreign.fulbrightonline.org",
      country: "USA",
      description: null,
    },
    country: "USA",
    eligibleCountries: [],
    degreeLevel: "MASTERS",
    fieldsOfStudy: [],
    fundingType: "FULL",
    fundingAmount: null,
    currency: null,
    benefits: ["Full tuition", "Living stipend", "Health insurance", "Airfare and settling-in allowance"],
    deadline: null,
    officialUrl: "https://foreign.fulbrightonline.org/",
    applicationUrl: "https://foreign.fulbrightonline.org/",
    eligibility:
      "Must hold a bachelor's degree or equivalent, meet English language proficiency requirements, and possess strong leadership potential.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Submit applications through the U.S. Embassy or Fulbright Commission in your home country.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vanier-2025",
    slug: "vanier-canada-graduate-scholarships",
    title: "Vanier Canada Graduate Scholarships",
    description:
      "The Vanier CGS program helps Canadian institutions attract highly qualified doctoral students to Canadian universities by offering prestigious awards.",
    organization: {
      name: "Government of Canada",
      website: "https://vanier.gc.ca",
      country: "Canada",
      description: null,
    },
    country: "Canada",
    eligibleCountries: [],
    degreeLevel: "PHD",
    fieldsOfStudy: ["Health", "Natural Sciences", "Engineering", "Social Sciences"],
    fundingType: "FULL",
    fundingAmount: 50000,
    currency: "CAD",
    benefits: ["$50,000 CAD per year for 3 years during doctoral studies"],
    deadline: null,
    officialUrl: "https://vanier.gc.ca/en/home-accueil.html",
    applicationUrl: "https://vanier.gc.ca/en/home-accueil.html",
    eligibility:
      "Demonstrate high academic excellence, research potential, and strong leadership capabilities.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Must be nominated by a Canadian institution with a quota to host Vanier scholars.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "destination-australia-2025",
    slug: "destination-australia-scholarship",
    title: "Destination Australia Scholarship",
    description:
      "The Destination Australia program supports domestic and international students to study in regional Australia by providing financial assistance.",
    organization: {
      name: "Australian Department of Education",
      website: "https://www.education.gov.au",
      country: "Australia",
      description: null,
    },
    country: "Australia",
    eligibleCountries: [],
    degreeLevel: "UNDERGRADUATE",
    fieldsOfStudy: [],
    fundingType: "PARTIAL",
    fundingAmount: 15000,
    currency: "AUD",
    benefits: ["Up to $15,000 AUD per year to assist with study and living costs"],
    deadline: null,
    officialUrl: "https://www.education.gov.au/destination-australia",
    applicationUrl: "https://www.education.gov.au/destination-australia",
    eligibility: "Full-time study at a regional campus of a participating tertiary education provider.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Apply directly to participating Australian tertiary institutions.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "daad-2025",
    slug: "daad-development-postgraduate-courses",
    title: "DAAD Development-Related Postgraduate Courses (EPOS)",
    description:
      "DAAD supports foreign graduates from development-related countries to pursue postgraduate education in Germany, fostering international academic exchange.",
    organization: {
      name: "German Academic Exchange Service (DAAD)",
      website: "https://www.daad.de",
      country: "Germany",
      description: null,
    },
    country: "Germany",
    eligibleCountries: [],
    degreeLevel: "MASTERS",
    fieldsOfStudy: ["Development", "Engineering"],
    fundingType: "FULL",
    fundingAmount: null,
    currency: null,
    benefits: ["Monthly payment of 934 euros for graduates", "Health insurance", "Travel allowance"],
    deadline: null,
    officialUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    applicationUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    eligibility:
      "At least 2 years of professional experience, bachelor degree completed within the last 6 years.",
    requirements: [],
    documents: [],
    applicationInstructions:
      "Applications must be sent directly to the designated degree program at participating German universities.",
    article: null,
    updatedAt: new Date().toISOString(),
  },
];

// ─── Fallback filtering ───────────────────────────────────────────────────────


function filterFallbackScholarships(params?: ScholarshipQueryParams): ScholarshipsResponse {
  let filtered: Scholarship[] = [...FALLBACK_SCHOLARSHIPS];

  if (params) {
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          (s.organization?.name ?? "").toLowerCase().includes(q),
      );
    }
    if (params.country) {
      const c = params.country.toLowerCase();
      filtered = filtered.filter((s) => (s.country ?? "").toLowerCase().includes(c));
    }
    if (params.degreeLevel) {
      filtered = filtered.filter((s) => s.degreeLevel === params.degreeLevel);
    }
    if (params.fundingType) {
      filtered = filtered.filter((s) => s.fundingType === params.fundingType);
    }
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return { scholarships: paginated, total, page, limit, totalPages };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of published scholarships from the Scholarship Pipeline API.
 *
 * - Only ACTIVE scholarships with at least one PUBLISHED article are returned.
 * - On any network or API error, the function falls back to the local
 *   FALLBACK_SCHOLARSHIPS dataset so the page always renders.
 * - Result is cached for 30 minutes (next.revalidate = 1800).
 */
export async function getScholarships(
  params?: ScholarshipQueryParams,
): Promise<ScholarshipsResponse> {
  const url = new URL(`${SCHOLARSHIP_API_URL}/api/public/scholarships`);

  if (params) {
    if (params.search) url.searchParams.set("search", params.search);
    if (params.country) url.searchParams.set("country", params.country);
    if (params.degreeLevel) url.searchParams.set("degreeLevel", params.degreeLevel);
    if (params.fundingType) url.searchParams.set("fundingType", params.fundingType);
    if (params.page) url.searchParams.set("page", params.page.toString());
    if (params.limit) url.searchParams.set("limit", params.limit.toString());
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });

    if (!res.ok) {
      console.warn(
        `[scholarships] API returned HTTP ${res.status} — using fallback dataset`,
      );
      return filterFallbackScholarships(params);
    }

    const envelope: ApiEnvelope<ScholarshipsListPayload> = await res.json();

    if (!envelope.success) {
      console.warn(
        `[scholarships] API returned success:false — ${envelope.error ?? "unknown error"} — using fallback dataset`,
      );
      return filterFallbackScholarships(params);
    }

    const payload = envelope.data;
    const scholarships = payload.data ?? [];

    /**
     * A successful response carrying zero scholarships is treated as "backend
     * has nothing to publish yet" and falls back to the curated dataset.
     *
     * This is the case the fallback was written for and the one it used to
     * miss: the Pipeline only exposes scholarships that have a PUBLISHED
     * article, so while article generation is incomplete the API answers
     * `{success: true, data: [], total: 0}`. That is not an error, so every
     * guard above passes and the page rendered an empty "No scholarships
     * found" state while six perfectly good entries sat unused.
     *
     * The visitor's own filters are re-applied to the fallback rather than
     * bypassed, so searching or filtering still narrows the list and a query
     * that genuinely matches nothing still shows the empty state. Falling back
     * only on *unfiltered* requests was the obvious alternative, but it reads
     * as broken: the page would list Chevening while searching "Chevening"
     * returned nothing.
     */
    if (scholarships.length === 0) {
      console.warn(
        "[scholarships] API returned no published scholarships — using fallback dataset",
      );
      return filterFallbackScholarships(params);
    }

    return {
      scholarships,
      total: payload.total ?? 0,
      page: payload.page ?? 1,
      limit: payload.limit ?? 12,
      totalPages: payload.totalPages ?? 1,
    };
  } catch (error) {
    console.warn("[scholarships] API unreachable — using fallback dataset:", error);
    return filterFallbackScholarships(params);
  }
}

/**
 * Fetch a single scholarship by its article slug (or scholarship UUID).
 *
 * The Scholarship Pipeline backend accepts the article slug as the `[id]`
 * parameter — it searches by `{ scholarship.id } OR { article.slug } OR { article.id }`.
 * Passing the article slug from the URL is therefore the correct and intended usage.
 *
 * Returns `null` if the scholarship is not found or has no published article.
 */
export async function getScholarshipBySlug(slug: string): Promise<Scholarship | null> {
  const url = `${SCHOLARSHIP_API_URL}/api/public/scholarships/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Not found in live API — check fallback dataset
        return FALLBACK_SCHOLARSHIPS.find((s) => s.slug === slug) ?? null;
      }
      console.warn(
        `[scholarships] API returned HTTP ${res.status} for slug "${slug}" — checking fallback`,
      );
      return FALLBACK_SCHOLARSHIPS.find((s) => s.slug === slug) ?? null;
    }

    const envelope: ApiEnvelope<Scholarship> = await res.json();

    if (!envelope.success) {
      console.warn(
        `[scholarships] API returned success:false for slug "${slug}" — ${envelope.error ?? "unknown"} — checking fallback`,
      );
      return FALLBACK_SCHOLARSHIPS.find((s) => s.slug === slug) ?? null;
    }

    return envelope.data ?? null;
  } catch (error) {
    console.warn(
      `[scholarships] API unreachable for slug "${slug}" — checking fallback:`,
      error,
    );
    return FALLBACK_SCHOLARSHIPS.find((s) => s.slug === slug) ?? null;
  }
}
