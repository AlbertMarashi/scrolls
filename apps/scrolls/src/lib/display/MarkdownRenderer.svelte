<script lang="ts">
import BlocksArray from "$lib/display/markdown-blocks/BlocksArray.svelte"
import { generate_ast } from "@siteforge/markdown-utils"
import PhrasingContentArray from "./markdown-blocks/PhrasingContentArray.svelte"

let {
    markdown = $bindable(""),
} : {
    markdown?: string
} = $props()

let ast = $derived(generate_ast(markdown))


</script>
<BlocksArray blocks={ast.children}/>