<script lang="ts">
import GenericBlock from "./GenericBlock.svelte"
import type { RootContent } from "@siteforge/markdown-utils"

let { blocks }: {
    blocks: RootContent[];
} = $props()
</script>
<blocks>
    {#each blocks as block (block)}
        <GenericBlock {block}/>
    {/each}
</blocks>
<style>
blocks {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
