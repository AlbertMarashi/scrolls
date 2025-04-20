<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"
import BlocksArray from "./BlocksArray.svelte"

let { block }: {
    block: RootContentMap["blockquote"]
} = $props()

</script>
<blockquote>
    <BlocksArray blocks={block.children}/>
</blockquote>
<style>
blockquote {
    margin: 0;
    border-left: 4px solid rgba(var(--foreground-rgb), 0.15);
    background: rgba(var(--foreground-rgb), 0.05);
    padding: 12px;
}
</style>
