<script lang="ts">
import type { PhrasingContent } from "@siteforge/markdown-utils"
import PhrasingContentComponent from "./PhrasingContent.svelte"

let { children }: {
    children: PhrasingContent[];
} = $props()
    </script>
{#each children as block (block)}
    <PhrasingContentComponent {block}/>
{/each}
