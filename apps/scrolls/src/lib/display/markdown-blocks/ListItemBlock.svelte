<script lang="ts">
import Icon from "$lib/display/Icon.svelte"
import CheckboxBlank from "svelte-material-icons/CheckboxBlank.svelte"
import CheckboxMarked from "svelte-material-icons/CheckboxMarked.svelte"
import BlocksArray from "./BlocksArray.svelte"
import type { RootContentMap } from "@siteforge/markdown-utils"

let {
    block,
}: {
    block: RootContentMap["listItem"]
} = $props()

</script>
<li>
    {#if typeof block.checked === "boolean"}
        <Icon icon={block.checked ? CheckboxMarked : CheckboxBlank}/>
    {/if}
    <BlocksArray blocks={block.children}/>
</li>
<style>
li {
    margin: 0;
    &::marker {
        font-weight: 600;
    }
}
</style>
