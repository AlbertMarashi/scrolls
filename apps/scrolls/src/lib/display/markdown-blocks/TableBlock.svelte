<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"
import PhrasingContentArray from "./PhrasingContentArray.svelte"

let {
    block,
}: {
    block: RootContentMap["table"]
} = $props()

let columns = $derived(block.children?.[0].children.length ?? 0)
</script>
<div
    style:--columns={ columns }
    class="grid-table">
    {#each block.children as row, i (row)}
        {#each row.children as cell (cell)}
            <div
                class="grid-cell"
                class:header={ i === 0 }>
                <PhrasingContentArray children={cell.children}/>
            </div>
        {/each}
    {/each}
</div>
<style>
.grid-table {
    display: grid;
    border-radius: 4px;
    width: 100%;
    grid-template-columns: repeat(var(--columns), fit-content(100%));
    overflow: hidden;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.grid-cell {
    padding: 4px 8px;
    &::after {
        display: block;
        font-size: 0.1px;
    }
    &.header {
        background: rgba(255, 255, 255, 0.08);
    }
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    &:last-child {
        border-bottom-right-radius: 4px;
    }
}
</style>
