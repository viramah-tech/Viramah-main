import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Content pages use Hindi text with apostrophes/quotes — not a real issue
      "react/no-unescaped-entities": "off",
      // Downgrade to warning while types are incrementally tightened
      "@typescript-eslint/no-explicit-any": "warn",
      // Config/script files use CommonJS require() legitimately
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
