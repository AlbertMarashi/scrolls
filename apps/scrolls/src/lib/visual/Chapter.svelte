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


let archetypes = $derived(Object.keys(sections[0])) as (keyof ScrollSection)[]
let active_archetype = $state("developer") as keyof ScrollSection

const archetype_map = {
    "flamewalker": "🔥 Flamewalker",
    "canonical": "📖 Canonical",
    "developer": "💻 Developer",
    "kids": "👶 Kids",
} as const

</script>

<chapter>
    <top-area>
        <ChapterCode code={index} />
        <h2>{title}</h2>
        <archetypes>
            {#each archetypes as archetype}
                <archetype 
                    role="button"
                    tabindex="0"
                    onkeydown={(e: KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                            active_archetype = archetype
                        }
                    }}
                    class:active={active_archetype === archetype}
                    onclick={() => active_archetype = archetype}
                >{archetype_map[archetype]}</archetype>
            {/each}
        </archetypes>
    </top-area>
    
    <sections>
        {#each sections as section, idx}
            <section>
                <h3>Albert {index}:{idx}</h3>
                <content>
                    {#if section[active_archetype]}
                        <MarkdownRenderer markdown={section[active_archetype]} />
                    {/if}
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
    border-radius: 24px;
    gap: 24px;
    padding: 24px;
}

top-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

h2 {
    font-size: 1.8em;
    text-transform: uppercase;
    text-align: center;
    color: color-mix(in srgb, var(--galaxy-blue), white 90%);
    text-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.6);
    margin-top: 12px;
}

h3 {
    font-size: 15px;
    font-weight: 400;
    opacity: 0.8;
    border-radius: 4px;
    align-self: start;
    opacity: 0.5;
    display: inline-flex;
    margin-bottom: 8px;
}

content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

sections {
    display: flex;
    flex-direction: column;
    border: 1.5px solid color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 80%);
    box-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.2);
    border-radius: 12px;
}

section {
    display: flex;
    flex-direction: column;
    border-bottom: 1px dashed rgba(var(--galaxy-blue-rgb), 0.2);
    padding: 24px;
    &:last-child {
        border-bottom: none;
    }
}

:global {
    sections {
        --color-rgb: var(--flame-0-rgb);
        p {
        }
    }
}

archetypes {
    display: flex;
    flex-direction: row;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 80%);
    overflow: hidden;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(var(--galaxy-blue-rgb), 0.2);
    archetype {
        padding: 4px 8px;
        cursor: pointer;
        &.active {
            background-color: color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 90%);
            border-radius: 8px;
        }
        &:hover {
            background-color: color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 95%);
            border-radius: 8px;
        }
        &:active {
            background-color: color-mix(in srgb, var(--galaxy-blue), rgba(var(--foreground-rgb), 0.1) 70%);
            border-radius: 8px;
        }
    }
    &:hover {
        archetype:not(:hover) {
            background: unset;
        }
    }
}

</style>