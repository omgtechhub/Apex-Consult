import { DegreeLevel, FundingType, ScholarshipOrganization } from "./types";

// ─── Degree level ──────────────────────────────────────────────────────────────

const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  UNDERGRADUATE: "Undergraduate",
  MASTERS: "Master's",
  PHD: "PhD",
  POSTDOCTORAL: "Postdoctoral",
  SHORT_COURSE: "Short Course",
  ONLINE: "Online",
  ANY: "Any Level",
  UNKNOWN: "Any Level",
};

export function formatDegreeLevel(level: DegreeLevel | null | undefined): string {
  if (!level) return "";
  return DEGREE_LEVEL_LABELS[level] ?? level;
}

// ─── Funding type ──────────────────────────────────────────────────────────────

const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  FULL: "Fully Funded",
  PARTIAL: "Partial Funding",
  TUITION_ONLY: "Tuition Only",
  LIVING_ALLOWANCE: "Living Allowance",
  TRAVEL: "Travel Grant",
  UNKNOWN: "Funding Available",
};

/**
 * Returns a human-readable funding label.
 * If `amount` and `currency` are provided they are appended (e.g. "Partial Funding — $15,000 / yr").
 */
export function formatFundingType(
  type: FundingType | null | undefined,
  amount?: number | null,
  currency?: string | null,
): string {
  const label = type ? (FUNDING_TYPE_LABELS[type] ?? type) : "Funding Available";
  if (amount && amount > 0) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(amount);
    return `${label} — ${formatted} / yr`;
  }
  return label;
}

// ─── Provider / organisation name ──────────────────────────────────────────────

/**
 * Returns the scholarship provider name.
 * Prefers `organization.name`; falls back to a generic string.
 */
export function providerName(
  organization: ScholarshipOrganization | null | undefined,
): string {
  return organization?.name ?? "Unknown Provider";
}

// ─── Deadline ─────────────────────────────────────────────────────────────────

/**
 * Formats an ISO 8601 deadline string for display.
 * Returns "Open deadline" when the value is null / undefined / unparseable.
 */
export function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return "Open deadline";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Open deadline";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Open deadline";
  }
}

/**
 * Returns true when the deadline has already passed (UTC).
 */
export function isDeadlinePassed(iso: string | null | undefined): boolean {
  if (!iso) return false;
  try {
    return new Date(iso).getTime() < Date.now();
  } catch {
    return false;
  }
}

// ─── Fields of study ──────────────────────────────────────────────────────────

/**
 * Joins a fieldsOfStudy array into a display string.
 * Returns "All Fields" for an empty or missing array.
 */
export function formatFieldsOfStudy(fields: string[] | null | undefined): string {
  if (!fields || fields.length === 0) return "All Fields";
  return fields.join(", ");
}
