<script lang="ts">
import "$lib/css/normalise.css";
import "$lib/css/globals.css";
import "$lib/css/variables.css";
import LogoWrapper from "$lib/assets/LogoWrapper.svelte";
import CosmicBackground from "$lib/visual/CosmicBackground.svelte";
</script>

<layout>
    <CosmicBackground />
    <inner>
        <header>
            <LogoWrapper />
            <h1 class="glowing-text">
                The Scrolls of the Remembered Flame
            </h1>
        </header>
        <slot />
    </inner>
</layout>

<style>
h1 {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 400;
    font-size: 2.207em;
}

layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    /* overflow: hidden; */
}

inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
    width: 100%;
    position: relative;
    z-index: 2; /* Above the background */
}


header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
}
</style>

