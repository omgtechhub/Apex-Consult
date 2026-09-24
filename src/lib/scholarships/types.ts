// ─── Prisma enum mirrors ───────────────────────────────────────────────────────
// These are the exact string values the Scholarship Pipeline backend stores and
// returns. Filter query params MUST use these values (the API does exact matching).

export type DegreeLevel =
  | "UNDERGRADUATE"
  | "MASTERS"
  | "PHD"
  | "POSTDOCTORAL"
  | "SHORT_COURSE"
  | "ONLINE"
  | "ANY"
  | "UNKNOWN";

export type FundingType =
  | "FULL"
  | "PARTIAL"
  | "TUITION_ONLY"
  | "LIVING_ALLOWANCE"
  | "TRAVEL"
  | "UNKNOWN";

// ─── Sub-interfaces ────────────────────────────────────────────────────────────

export interface ScholarshipOrganization {
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
}

/**
 * SEO metadata attached to a published article.
 * The listing endpoint returns a partial select (no ogImage / twitterTitle /
 * twitterDescription / slug / id / articleId / createdAt / updatedAt).
 * The detail endpoint uses `seo: true` (full Prisma record) which includes all
 * fields below. Optional fields cover both cases.
 */
export interface ArticleSEO {
  // ── System fields (full detail select only) ──────────────────────────────
  /** Prisma record UUID — only present on detail endpoint response */
  id?: string;
  /** FK back to the article — only present on detail endpoint response */
  articleId?: string;
  /** ISO 8601 string — only present on detail endpoint response */
  createdAt?: string;
  /** ISO 8601 string — only present on detail endpoint response */
  updatedAt?: string;

  // ── SEO slug (detail only) ───────────────────────────────────────────────
  /**
   * The SEO-specific slug stored in ArticleSEO.
   * Distinct from Article.slug — only present on the detail endpoint response
   * (the listing partial select does not include it).
   */
  slug?: string;

  // ── Core SEO fields (both listing and detail) ────────────────────────────
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;

  // ── Extended OG / Twitter (detail only) ─────────────────────────────────
  /** Only present on the detail endpoint response */
  ogImage?: string | null;
  /** Only present on the detail endpoint response */
  twitterTitle?: string | null;
  /** Only present on the detail endpoint response */
  twitterDescription?: string | null;

  // ── Structured data ──────────────────────────────────────────────────────
  jsonLd: Record<string, unknown> | null;
  faqSchema: Record<string, unknown> | null;
  breadcrumbSchema: Record<string, unknown> | null;
}

export interface ScholarshipArticle {
  id: string;
  title: string;
  /** Unique article slug — also used as the public-facing URL segment */
  slug: string;
  content: string;
  wordCount: number | null;
  readingTime: number | null;
  /** ISO 8601 datetime string */
  publishedAt: string | null;
  seo: ArticleSEO | null;
}

// ─── Core scholarship shape ────────────────────────────────────────────────────

/**
 * Fields returned by both the listing and detail endpoints.
 *
 * `slug` = article.slug ?? scholarship.id (computed by the backend).
 * Use it as the URL path segment: `/scholarships/[slug]`.
 *
 * `deadline` is an ISO 8601 datetime string (from Prisma DateTime?).
 * Format it for display with `formatDeadline()` from utils.ts.
 *
 * `degreeLevel` and `fundingType` are raw Prisma enum values.
 * Format them for display with `formatDegreeLevel()` / `formatFundingType()`.
 */
export interface ScholarshipSummary {
  id: string;
  /** article.slug ?? scholarship.id */
  slug: string;
  title: string;
  description: string | null;
  organization: ScholarshipOrganization | null;
  country: string | null;
  eligibleCountries: string[];
  degreeLevel: DegreeLevel;
  fieldsOfStudy: string[];
  fundingType: FundingType;
  fundingAmount: number | null;
  currency: string | null;
  benefits: string[];
  /** ISO 8601 datetime string — may be null */
  deadline: string | null;
  officialUrl: string;
  applicationUrl: string | null;
  /** The single published article attached to this scholarship (null if none) */
  article: ScholarshipArticle | null;
  /** ISO 8601 datetime string */
  updatedAt: string;
}

/**
 * Full scholarship shape returned by the detail endpoint.
 * Extends ScholarshipSummary with fields not returned by the listing endpoint.
 */
export interface Scholarship extends ScholarshipSummary {
  eligibility: string | null;
  requirements: string[];
  documents: string[];
  applicationInstructions: string | null;
}

// ─── API response wrappers ─────────────────────────────────────────────────────

/** Every backend response is wrapped in this envelope */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

/** Raw paginated payload inside the listing envelope's `data` property */
export interface ScholarshipsListPayload {
  data: ScholarshipSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Shape returned by `getScholarships()` to the page layer.
 * The client normalizes the backend envelope so pages never touch raw API JSON.
 */
export interface ScholarshipsResponse {
  scholarships: ScholarshipSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Query params ──────────────────────────────────────────────────────────────

export interface ScholarshipQueryParams {
  search?: string;
  country?: string;
  /** Must be an exact Prisma DegreeLevel enum value or empty string */
  degreeLevel?: DegreeLevel | "";
  /** Must be an exact Prisma FundingType enum value or empty string */
  fundingType?: FundingType | "";
  page?: number;
  limit?: number;
}
