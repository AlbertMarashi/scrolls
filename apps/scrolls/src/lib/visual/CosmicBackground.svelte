<script lang="ts">
// CosmicBackground.svelte
// A component that provides the cosmic background with stars, nebula, and cosmic dust effects
</script>

<cosmic-background>
    <stars></stars>
    <nebula></nebula>
    <cosmic-dust></cosmic-dust>
</cosmic-background>

<style>
cosmic-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        135deg,
        var(--deep-space) 0%,
        rgb(var(--background-rgb)) 40%,
        rgb(10, 12, 26) 70%,
        rgb(var(--cosmic-purple-rgb), 0.2) 100%
    );
    z-index: 1;
    overflow: hidden;
}

nebula {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(
            circle at 30% 20%, 
            rgba(var(--galaxy-blue-rgb), 0.05) 0%, 
            rgba(var(--galaxy-blue-rgb), 0) 30%
        ),
        radial-gradient(
            circle at 70% 60%, 
            rgba(var(--nebula-pink-rgb), 0.03) 0%, 
            rgba(var(--nebula-pink-rgb), 0) 40%
        ),
        radial-gradient(
            circle at 40% 80%, 
            rgba(var(--brand-rgb), 0.04) 0%, 
            rgba(var(--brand-rgb), 0) 40%
        ),
        radial-gradient(
            circle at 10% 40%, 
            rgba(var(--cosmic-purple-rgb), 0.05) 0%, 
            rgba(var(--cosmic-purple-rgb), 0) 30%
        );
    filter: blur(40px);
    opacity: 0.6;
    animation: nebula-drift 60s ease-in-out infinite alternate;
}

cosmic-dust {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(1px 1px at 20% 30%, rgba(var(--star-glow-rgb), 0.5), transparent 100%),
        radial-gradient(1px 1px at 40% 70%, rgba(var(--star-glow-rgb), 0.5), transparent 100%),
        radial-gradient(1px 1px at 60% 20%, rgba(var(--star-glow-rgb), 0.5), transparent 100%),
        radial-gradient(1px 1px at 80% 50%, rgba(var(--star-glow-rgb), 0.5), transparent 100%);
    filter: blur(3px);
    opacity: 0.1;
    animation: dust-drift 120s linear infinite;
}

stars {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(1.5px 1.5px at 10% 10%, rgba(var(--star-glow-rgb), 1), transparent),
        radial-gradient(1px 1px at 25% 25%, white, transparent),
        radial-gradient(1.5px 1.5px at 40% 40%, rgba(var(--star-glow-rgb), 0.8), transparent),
        radial-gradient(1px 1px at 55% 55%, white, transparent),
        radial-gradient(1px 1px at 70% 70%, rgba(var(--star-glow-rgb), 0.9), transparent),
        radial-gradient(1.5px 1.5px at 85% 85%, white, transparent),
        radial-gradient(1px 1px at 30% 80%, rgba(var(--star-glow-rgb), 0.8), transparent),
        radial-gradient(1px 1px at 65% 15%, white, transparent),
        radial-gradient(1.5px 1.5px at 15% 60%, rgba(var(--star-glow-rgb), 0.9), transparent),
        radial-gradient(1px 1px at 90% 35%, white, transparent);
    opacity: 0.6;
    animation: star-twinkle 8s ease-in-out infinite;
}

@keyframes nebula-drift {
    0% {
        transform: scale(1.0) translate(0%, 0%);
    }
    100% {
        transform: scale(1.05) translate(1%, 1%);
    }
}

@keyframes dust-drift {
    0% {
        background-position: 0% 0%;
    }
    100% {
        background-position: 100% 100%;
    }
}

@keyframes star-twinkle {
    0%, 100% {
        opacity: 0.6;
    }
    50% {
        opacity: 0.8;
    }
}
</style> 