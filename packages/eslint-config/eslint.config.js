import { includeIgnoreFile } from "@eslint/compat"
import globals from "globals"
import { fileURLToPath } from "node:url"
import stylisticTs from "@albertmarashi/eslint-plugin-ts"
import tslint from "typescript-eslint"

export default defineConfig()

/**
 * @param {...import('typescript-eslint').InfiniteDepthConfigWithExtends} args
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function defineConfig(...args) {
    return tslint.config([
        includeIgnoreFile(fileURLToPath(new URL("../../.gitignore", import.meta.url))),
        ...tslint.configs.recommended,
        {
            languageOptions: {
                globals: {
                    ...globals.browser,
                    ...globals.node,
                },
            },
            plugins: {
                "@stylistic/ts": stylisticTs,
            },
            rules: {
                "@typescript-eslint/no-unused-vars": [
                    "warn",
                    {
                        argsIgnorePattern: "^_",
                        varsIgnorePattern: "^_",
                        caughtErrors: "none",
                    },
                ],
                "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
                "@typescript-eslint/no-unused-expressions": "off",
                "@stylistic/ts/indent": [
                    "error",
                    4,
                    {
                        SwitchCase: 1,
                    },
                ],
                "arrow-parens": [
                    "error",
                    "as-needed",
                    { requireForBlockBody: false },
                ],
                "no-constant-condition": ["error", { checkLoops: false }],
                "no-implicit-coercion": [
                    "error",
                    {
                        allow: ["!!"],
                    },
                ],
                // disallow semi-colon
                "@stylistic/ts/semi": ["error", "never"],
                "@stylistic/ts/quotes": ["error", "double"],
                "no-self-assign": "off",
                "no-empty": "off",
                "@stylistic/ts/object-property-newline": [
                    "error",
                    {
                        allowAllPropertiesOnSameLine: false,
                    },
                ],
                "@stylistic/ts/object-curly-newline": [
                    "error",
                    {
                        ObjectExpression: {
                            multiline: true,
                            consistent: true,
                            minProperties: 3,
                        },
                        ObjectPattern: {
                            multiline: true,
                            consistent: true,
                            minProperties: 3,
                        },
                        ImportDeclaration: {
                            multiline: true,
                            consistent: true,
                            minProperties: 2,
                        },
                    },
                ],
                "@stylistic/ts/object-curly-spacing": ["error", "always"],
                "@stylistic/ts/comma-dangle": ["error", "always-multiline"],
                "@stylistic/ts/comma-spacing": [
                    "error",
                    {
                        before: false,
                        after: true,
                    },
                ],
                "eol-last": ["error", "always"],
                "no-multiple-empty-lines": [
                    "error",
                    {
                        max: 1,
                    },
                ],
                "arrow-spacing": [
                    "error",
                    {
                        before: true,
                        after: true,
                    },
                ],
                "array-element-newline": [
                    "error",
                    {
                        multiline: true,
                        minItems: 3,
                    },
                ],
                "array-bracket-spacing": ["error", "never"],
                "array-bracket-newline": [
                    "error",
                    {
                        multiline: true,
                        minItems: 3,
                    },
                ],
                "@typescript-eslint/no-empty-object-type": "off",
            },
        },
        ...args,
    ])
}
