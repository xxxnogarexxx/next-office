import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off scripts — not part of the app build
    "scripts/**",
    // Supabase Edge Functions — Deno runtime, incompatible with Node/Next ESLint
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
