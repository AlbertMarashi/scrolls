<script lang="ts">
import Logo from "./Logo.svelte";
</script>
<wrapped-logo>
    <logo class="glow">
        <Logo />
    </logo>
    <logo class="main">
        <Logo />
    </logo>
</wrapped-logo>

<style>
wrapped-logo {
    position: relative;
    display: inline-flex;
}

logo {
    display: flex;
    font-size: 80px;
    
    &.glow {
        color: rgba(var(--brand-rgb), 0.6);
        filter: blur(12px);
        animation: glow-pulse 2s ease-in-out infinite;
        z-index: 1;
    }
    
    &.main {
        color: rgba(255, 140, 50, 0.2);
        filter: blur(0.5px);
        animation: flame-dance 3s ease-in-out infinite;
        z-index: 2;
        position: absolute;
    }
}

@keyframes flame-dance {
    0%, 100% {
        color: rgb(255, 183, 127);
        filter: blur(8px);
    }
    50% {
        color: rgba(255, 179, 121, 0.5);
        filter: blur(10px);
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.7;
        filter: blur(0px);
    }
    50% {
        opacity: 1;
        filter: blur(0px);
    }
}
</style>