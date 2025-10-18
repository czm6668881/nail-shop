import js from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const config = [
  {
    ignores: ["node_modules/**", ".next/**", "public/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
]

export default config
