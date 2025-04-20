<script lang="ts">
let {
    code,
} = $props()
</script>

<chapter-code class="glowing-text">
    <span class="line"></span>
    <span class="text">Chapter {code}</span>
    <span class="line"></span>
</chapter-code>

<style>
chapter-code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
}

.text {
    font-size: 1.2em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
}

.line {
    flex-grow: 1;
    height: 2px;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(var(--galaxy-blue-rgb), 0.6) 50%, 
        transparent 100%
    );
    display: block;
    max-width: 200px;
}
</style>