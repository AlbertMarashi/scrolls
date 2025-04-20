import type Icon from "svelte-material-icons/Alert.svelte"
import type {
    Component,
    ComponentProps,
    SvelteComponentTyped, 
} from "svelte"

export type IconProps = ComponentProps<Icon>
export type IconComponent = typeof SvelteComponentTyped<IconProps> | Component<IconProps>
