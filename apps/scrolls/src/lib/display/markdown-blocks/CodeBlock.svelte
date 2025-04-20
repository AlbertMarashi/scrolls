<script lang="ts">
import hljs from "highlight.js"
import "./code-theme.css"

let {
    language,
    code, 
}: {
    language: string | null | undefined;
    code: string;
} = $props()

let pre: HTMLPreElement = $state()!
let code_el: HTMLElement = $state()!

let highlighted_code = $derived(hljs.highlight(code, {
    language: language === "pseudocode" || !language ? "plaintext" : language,
}))

let lines = $derived(highlighted_code.value.split("\n"))
let digits = $derived(lines.length.toString().length)
let numbers = $derived(lines.map((_, i) => {
    const number = (i + 1).toString()

    return ["0".repeat(digits - number.length), number]
}))

</script>
<pre bind:this={ pre }>
    <div
        class="header"
        class:show-header={ false }>
        <!-- {#if language}
            <Tag>{ language }</Tag>
        {/if} -->
        <!-- <div
            class="copy"
            on:keypress={ e => e.key === "Enter" ? copy() : null }
            onclick={ copy }>
            <Icon icon={ContentCopy}/>
        </div> -->
    </div>
    <code bind:this={ code_el }>
        <div class="line">
            <div class="number small">{ Array(digits).fill(" ").join("") }</div>
        </div>
        {#each lines as line, i (i)}
            <span class="line">
                <span class="number"><span class="zero">{ numbers[i][0] }</span>{ numbers[i][1] }</span>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <span class="code">{@html line}</span><!--
            --></span>
        {/each}
        <div class="line">
            <div class="number small">{ Array(digits).fill(" ").join("") }</div>
        </div>
    </code>
</pre>
<style>
/* .copy {
    display: inline-flex;
    cursor: pointer;
    color: white;
    font-size: 20px;
    padding: 6px;
    border-radius: 4px;
    user-select: none;
    color: rgba(255, 255, 255, 0.8);
    background: color-mix(white 15%, var(--dark-app));
    margin-left: auto;
}

.copy:hover,
.copy:active {
    color: white;
    background: rgba(var(--foreground-rgb), 0.1);
} */

.header {
    border-bottom: 1px solid rgba(var(--dark-rgb), 0.1);
    padding: 4px;
    display: contents;
    align-items: center;
    justify-content: space-between;
}

.header.show-header {
    display: flex;
}

/* .header:not(.show-header) .copy {
    position: absolute;
    top: 0;
    right: 0;
    margin: 10px;
} */

.number {
    white-space: pre-wrap;
    color: rgba(var(--foreground-rgb), 0.4);
    background: rgba(var(--foreground-rgb), 0.05);
    padding: 0 6px;
    letter-spacing: 2px;
}

.number .zero {
    display: inline;
    opacity: 0.4;
}

.number.small {
    height: 8px;
}

pre {
    position: relative;
    font-size: 12px;
    background: rgba(var(--foreground-rgb), 0.05);
    font-family: "Source Code Pro", monospace;
    border-radius: 4px;
    width: 100%;
    white-space: normal;
    user-select: none;
}

code {
    width: 100%;
    display: block;
    user-select: text;
}

.line {
    display: flex;
    gap: 16px;
    padding-right: 16px;
    line-height: 150%;
}

.code {
    white-space: pre-wrap;
}

:global {
    .hljs-strong {
        color: rgba(var(--flame-0-rgb), 0.8);
    }
}
</style>
