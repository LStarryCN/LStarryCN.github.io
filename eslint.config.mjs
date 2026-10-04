import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**", "out/**", "node_modules/**", "coverage/**",
    "playwright-report/**", "test-results/**", "next-env.d.ts",
    "public/search-index.json", "public/image-manifest.json",
  ]),
  {
    rules: {
      // Static export uses build-time picture/srcset assets, without an image server.
      "@next/next/no-img-element": "off",
      // Effects synchronize URL, theme, clock and dialog state with browser APIs.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
