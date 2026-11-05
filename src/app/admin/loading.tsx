/**
 * Loading fallback for the admin area.
 *
 * `AdminShell` is `min-h-screen bg-canvas`, and the `(app)` layout awaits a
 * database session check on every request, so this boundary is doing real work
 * rather than covering a few milliseconds.
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
  return <DocumentRouteSkeleton label="Loading admin…" wide />;
}
