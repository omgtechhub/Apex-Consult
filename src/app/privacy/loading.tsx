/**
 * Loading fallback for /privacy.
 *
 * `LegalShell` opens on the page canvas at `pt-24 lg:pt-32`, not on a hero.
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
  return <DocumentRouteSkeleton label="Loading privacy policy…" />;
}
