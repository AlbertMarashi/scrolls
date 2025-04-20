<script lang="ts">
import hljs from "highlight.js"
import "./code-theme.css"

let {
    code,
    language,
}: {
    code: string,
    language: string | null | undefined
} = $props()

let highlighted_code = $derived(hljs.highlight(code, {
    language: language === "pseudocode" || !language ? "plaintext" : language,
}))

</script>
<pre>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <code>{@html highlighted_code.value}</code>
</pre>
<style>

pre {
    position: relative;
    background: rgba(var(--foreground-rgb), 0.05);
    font-family: "Fira Code";
    border-radius: 4px;
    padding: 4px;
    white-space: normal;
}

code {
    width: 100%;
    font-size: 0.9em;
    display: inline;
    white-space: pre-wrap
}
</style>
