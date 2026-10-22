import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// docs/NO_USE_EFFECT_SPEC.md — public components never call React effect
// hooks directly; external synchronization routes through audited hooks in
// lib/ (useMountEffect, useMountLayoutEffect, useDomLayout).
const EFFECTS_MESSAGE =
  "Effects route through audited hooks in lib/ (useMountEffect, useMountLayoutEffect, useDomLayout). See docs/NO_USE_EFFECT_SPEC.md.";

const noDirectEffects = {
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "react",
          importNames: ["useEffect", "useLayoutEffect", "useInsertionEffect"],
          message: EFFECTS_MESSAGE,
        },
      ],
    },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector:
        "CallExpression[callee.object.name='React'][callee.property.name=/^use(Effect|LayoutEffect|InsertionEffect)$/]",
      message: EFFECTS_MESSAGE,
    },
  ],
};

const effectsOff = {
  "no-restricted-imports": "off",
  "no-restricted-syntax": "off",
};

// Audited escape hatches — the only files allowed raw effect hooks.
const ESCAPE_HATCHES = [
  "lib/use-mount-effect.ts",
  "lib/use-mount-layout-effect.ts",
  "lib/use-dom-layout.ts",
  "lib/use-ticker.ts",
];

// Temporary: spec §4.1 files still on direct effects, awaiting their slice.
// This list only ever shrinks — do not add to it.
const MIGRATION_IN_PROGRESS = [];

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
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: noDirectEffects,
  },
  {
    files: [...ESCAPE_HATCHES, ...MIGRATION_IN_PROGRESS, "sample/**"],
    rules: effectsOff,
  },
]);

export default eslintConfig;
