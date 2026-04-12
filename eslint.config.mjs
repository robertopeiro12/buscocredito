import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),

  ...nextCoreWebVitals,

  {
    name: "buscocredito/overrides",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Permitir variables con _ como no usadas (patron comun en destructuring)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    name: "buscocredito/react-overrides",
    files: ["**/*.{jsx,tsx}"],
    rules: {
      // React 19 no necesita import React
      "react/react-in-jsx-scope": "off",
      // TypeScript maneja prop-types
      "react/prop-types": "off",
    },
  },
]);
