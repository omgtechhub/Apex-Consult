import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  // `.next-preview/**` is the output of `npm run preview` (see
  // scripts/preview.mjs). It is generated, bundled code: linting it reports
  // dozens of errors from Turbopack's runtime that no one can act on, and
  // drowns out real findings in src/.
  globalIgnores([
    ".next/**",
    ".next-preview/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
