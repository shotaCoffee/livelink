import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/.solid/",
    "**/supabase/",
    "**/coverage/",
    "**/*.min.js",
    "**/*.config.js",
    "**/*.config.ts",
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/.solid/",
    "**/supabase/",
    "**/coverage/",
    "**/*.min.js",
    "**/*.min.css",
    "**/pnpm-lock.yaml",
    "**/package-lock.json",
]), {
    extends: compat.extends("eslint:recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    rules: {
        "prefer-const": "error",
        "no-var": "error",
        "no-unused-vars": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],
    },
}, {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
}, {
    files: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/test-setup.ts",
    ],

    languageOptions: {
        globals: {
            ...globals.jest,
            expect: "readonly",
            describe: "readonly",
            it: "readonly",
            beforeEach: "readonly",
            afterEach: "readonly",
            vi: "readonly",
        },
    },
}]);