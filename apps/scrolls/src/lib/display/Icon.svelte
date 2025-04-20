<script lang="ts">
import type { IconComponent } from "$lib/utils/icon_type"

let {
    icon,
}: {
    icon: IconComponent
} = $props()

let Icon = $derived(icon)
</script>
<div class="icon">
    <Icon/>
</div>
<style>

.icon {
    display: inline-flex;
    color: var(--color);
    font-size: var(--size);
    opacity: var(--opacity);
}
</style>
