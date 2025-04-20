<script lang="ts">
import type { RootContentMap } from "@siteforge/markdown-utils"
import PhrasingContentArray from "./PhrasingContentArray.svelte"

let { block }: {
    block: RootContentMap["paragraph"]
} = $props()

</script>
<p>
    <PhrasingContentArray children={block.children}/>
</p>
<style>
p {
    margin: 0;
    width: 100%;
}
</style>
