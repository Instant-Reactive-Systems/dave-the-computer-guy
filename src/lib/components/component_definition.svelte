<script lang="ts">
import type { ComponentDefinition } from "$lib/models/component_definition";
import { createEventDispatcher, onMount } from "svelte";

export let componentDefinition: ComponentDefinition;

const dispatch = createEventDispatcher();

function onComponentDefinitionSelected(){
    dispatch('componentDefinitonSelected', {
        componentDefinition: componentDefinition
    })
}

</script>

<div on:click={onComponentDefinitionSelected}>
    <p>{componentDefinition.name}</p>
    <img class="w-1/2 h-100" src={componentDefinition.metadata.imageUrl}/>
</div>