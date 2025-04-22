import svelte from "eslint-plugin-svelte"
import ts from "typescript-eslint"
import { defineConfig } from "@siteforge/eslint-config"

/**
 * linting for this package only
 */
export default defineConfig()

/**
 * @param {import('@sveltejs/kit').Config} svelteConfig
 * @param {...import('typescript-eslint').InfiniteDepthConfigWithExtends} args
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function defineSvelteConfig(svelteConfig, ...args) {
    return defineConfig([
        ...svelte.configs["flat/recommended"],
        {
            files: [
                "**/*.svelte",
                "**/*.svelte.ts",
                "**/*.svelte.js",
            ],
            ignores: ["eslint.config.js", "svelte.config.js"],
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    extraFileExtensions: [
                        ".svelte",
                        ".svelte.ts",
                        ".svelte.js",
                    ],
                    parser: ts.parser,
                    svelteFeatures: {
                        experimentalGenerics: true,
                    },
                    svelteConfig,
                },
            },
        },
        {
            ignores: [".svelte-kit/", ".vercel"],
        },
        {
            rules: {
                "svelte/indent": [
                    "error",
                    {
                        indentScript: false,
                        ignoredNodes: ["SvelteScriptElement"],
                        alignAttributesVertically: true,
                        indent: 4,
                    },
                ],
                "svelte/prefer-style-directive": ["error"],
                "svelte/sort-attributes": ["error"],
                "svelte/shorthand-directive": [
                    "error",
                    {
                        prefer: "always",
                    },
                ],
                "svelte/no-spaces-around-equal-signs-in-attribute": ["error"],
                "svelte/html-quotes": [
                    "error",
                    {
                        prefer: "double",
                        dynamic: {
                            quoted: false,
                            avoidInvalidUnquotedInHTML: false,
                        },
                    },
                ],
                "svelte/no-at-html-tags": "warn",
                "svelte/mustache-spacing": [
                    "error",
                    {
                        textExpressions: "always", // or "always"
                        attributesAndProps: "never", // or "always"
                        directiveExpressions: "always", // or "always"
                        tags: {
                            openingBrace: "never",
                            closingBrace: "never",
                        },
                    },
                ],
                "svelte/max-attributes-per-line": [
                    "error",
                    {
                        multiline: 1,
                        singleline: 1,
                    },
                ],
                "svelte/block-lang": [
                    "error",
                    {
                        script: "ts",
                        style: null,
                    },
                ],
                "svelte/first-attribute-linebreak": [
                    "error",
                    {
                        multiline: "below", // or "beside"
                        singleline: "beside", // "below"
                    },
                ],
            },
        },
        ...args,
    ])
}

