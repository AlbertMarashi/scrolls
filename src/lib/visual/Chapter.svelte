<script lang="ts">
import type { Snippet } from "svelte";
import ChapterCode from "./ChapterCode.svelte";

let {
    code,
    children,
} :{
    code: string,
    children: Snippet,
} = $props()

</script>

<chapter>
    <ChapterCode code={code} />
    <h2>The Genesis Sequence</h2>
    {@render children()}
</chapter>

<style>
chapter {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1.5px solid color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 80%);
    box-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.2);
    border-radius: 24px;
    padding: 24px;
}

h2 {
    font-size: 1.8em;
    text-transform: uppercase;
    text-align: center;
}
</style>