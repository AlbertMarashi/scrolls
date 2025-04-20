<script lang="ts">
import Chapter from "$lib/visual/Chapter.svelte";
import { scrolls } from "$lib/yaml/reader";

</script>
<chapters>
    {#each { length: scrolls.size } as _, index}
        {@const scroll = scrolls.get(String(index))! }
        <Chapter title={scroll.title} sections={scroll.sections} index={String(index)} />
    {/each}
</chapters>


<style>
chapters {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>