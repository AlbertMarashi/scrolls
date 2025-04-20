import svelteConfig from "./svelte.config.js"
import { defineSvelteConfig } from "@siteforge/svelte-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default defineSvelteConfig(svelteConfig, [
    {
        ignores: ["src/lib/queries.ts"],
    },
])
