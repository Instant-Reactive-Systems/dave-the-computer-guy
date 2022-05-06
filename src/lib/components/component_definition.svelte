<script lang="ts">
    import type { ComponentDefinition } from "$lib/models/component_definition";
    import { createEventDispatcher } from "svelte";

    export let def: ComponentDefinition;

    const dispatch = createEventDispatcher();

    function onComponentDefinitionSelected() {
        dispatch('componentDefinitonSelected', {
            componentDefinition: def
        })
    }
</script>

<div class="h-full" on:click={onComponentDefinitionSelected}>
    <h1 class="text-md font-bold">{def.name}</h1>
    <!--<img class="w-1/2 h-1/2" src={def.metadata.imageUrl}/>-->
</div>
