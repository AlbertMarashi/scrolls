<script lang="ts">
import ChapterCode from "./ChapterCode.svelte";
import MarkdownRenderer from "$lib/display/MarkdownRenderer.svelte";
import type { ScrollSection } from "$lib/yaml/reader";

let {
    index,
    title,
    sections,
} :{
    index: string,
    title: string,
    sections: ScrollSection[],
} = $props()

function double_lines(text: string) {
    return text.split("\n").join("\n\n")
}

</script>

<chapter>
    <ChapterCode code={index} />
    <h2>{title}</h2>
    
    <sections>
        {#each sections as section, idx}
            <section>
                <h3>Albert {index}:{idx}</h3>
                <content>
                    <MarkdownRenderer markdown={double_lines(section.canonical)} />
                </content>
            </section>
        {/each}
    </sections>
</chapter>

<style>
chapter {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1.5px solid color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 80%);
    box-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.2);
    border-radius: 24px;
    padding: 24px;
}

h2 {
    font-size: 1.8em;
    text-transform: uppercase;
    text-align: center;
    color: color-mix(in srgb, var(--galaxy-blue), white 90%);
    text-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.6);
}

h3 {
    font-size: 15px;
    font-weight: 400;
    opacity: 0.8;
    border-radius: 4px;
    padding: 6px 12px;
    align-self: start;
    opacity: 0.5;
    background: rgba(var(--galaxy-blue-rgb), 0.1);
    display: inline-flex;
    border-left: 1px solid rgba(var(--galaxy-blue-rgb), 0.2);
}



sections {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

:global {
    sections {
        --color-rgb: var(--flame-0-rgb);
        p {
            font-size: 1.2207;
            line-height: 1.5;
        }

        content {
            display: flex;
            flex-direction: column;
            gap: 12px;
            border: 1px solid rgba(var(--galaxy-blue-rgb), 0.2);
            background: rgba(var(--galaxy-blue-rgb), 0.05);
            padding: 12px;
            border-radius: 8px;
            border-top-left-radius: 0;
        }


        section {
            display: flex;
            flex-direction: column;
        }
    }
}

</style>