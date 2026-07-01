import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Переиспользуемые из JTBD-курса компоненты используют легитимный паттерн
  // гидрации persisted-стейта из localStorage на маунте и Math.random в
  // декоративном Confetti. Новые строгие правила React-compiler (Next 16.2)
  // ложно флагуют их как ошибки — понижаем до предупреждений.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
