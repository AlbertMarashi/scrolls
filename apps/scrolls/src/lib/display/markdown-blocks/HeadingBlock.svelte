<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"
import { get_plain_text } from "@siteforge/markdown-utils"
import PhrasingContent from "./PhrasingContentArray.svelte"

let { block }: {
    block: RootContentMap["heading"]
} = $props()

let plain_text = $derived(get_plain_text(block.children))
let id = $derived(plain_text.toLowerCase().replace(/ /g, "-"))

</script>
<svelte:element
    this={ "h" + block.depth }
    {id}>
    <PhrasingContent children={block.children}/>
</svelte:element>
<style>
h1 {
    font-size: 2.5em;
}
h2 {
    font-size: 1.8em;
}
h3 {
    font-size: 1.5em;
}
h4 {
    font-size: 1.25em;
}
h5 {
    font-size: 1.125em;
}
h6 {
    font-size: 1em;
}
</style>
