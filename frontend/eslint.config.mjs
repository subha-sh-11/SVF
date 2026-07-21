import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Include next/typescript so the @typescript-eslint/* rules are defined —
  // otherwise the inline `eslint-disable @typescript-eslint/no-explicit-any`
  // comments error with "Definition for rule ... was not found" and fail builds.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
