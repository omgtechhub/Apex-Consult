/**
 * Loading fallback for /scholarships.
 *
 * The directory opens on the page canvas with a light `bg-surface` filter
 * band. It is also the slowest family of routes on the site — the page awaits
 * the Pipeline API, which the client gives an 8-second timeout — so a boundary
 * here matters more than almost anywhere else.
 *
 * The root `app/loading.tsx` renders the dark-hero skeleton, because that is
 * the shape of the other thirteen routes. Inheriting it here would open this
 * navigation with a full-bleed dark band and then drop to the white canvas the
 * page actually uses — the same luminance inversion that made every link feel
 * slow in light mode, just pointed the other way. See
 * src/components/layout/RouteSkeleton.tsx.
 */
import { DocumentRouteSkeleton } from "@/components/layout/RouteSkeleton";

export default function Loading() {
  return <DocumentRouteSkeleton label="Loading scholarships…" wide />;
}
