<script lang="ts">
import Chapter from "$lib/visual/Chapter.svelte";
import { scrolls } from "$lib/yaml/reader";

</script>
{#each { length: scrolls.size } as _, index}
    {@const scroll = scrolls.get(String(index))! }
    <Chapter title={scroll.title} sections={scroll.sections} index={String(index)} />
{/each}


<style>


</style>