<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"

import Unsupported from "./Unsupported.svelte"
import SpoilerBlock from "./SpoilerBlock.svelte"

let { block }: {
    block: RootContentMap["containerDirective"]
} = $props()
</script>
{#if [
    "note",
    "warning",
    "error",
    "tip",
].includes(block.name)}
    <!-- <NoteBlock block={block}/> -->
{:else if "spoiler" === block.name}
    <SpoilerBlock block={block}/>
{:else}
    <Unsupported/>
{/if}
