<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"
import ListItemBlock from "./ListItemBlock.svelte"

let { block }: {
    block: RootContentMap["list"]
} = $props()

let tag = $derived(block.ordered ? "ol" : "ul")
</script>
<svelte:element this={ tag }>
    {#each block.children as child (child)}
        <ListItemBlock block={child}/>
    {/each}
</svelte:element>
<style>
ol, ul {
    margin: 0;
    padding: 0;
    margin-left: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.8em;
}

ol {
    list-style-type: decimal;
}

ul {
    list-style-type: disc;
}

</style>
