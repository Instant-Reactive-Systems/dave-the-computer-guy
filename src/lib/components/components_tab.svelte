<script lang="ts">
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
    import ComponentDefinitionComponent from './component_definition.svelte';
	import type { Subscription } from 'rxjs';
	import { eventStore } from '$lib/stores/event_store';
	import { Event } from '$lib/models/event';

	let componentDefinitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	let subscriptions: Subscription[] = [];
	let defs = [];
	let selectedComponentDefinition: ComponentDefinition;
	onMount(() => {
		subscriptions.push(
			componentDefinitionLoaderService.getDefinitionsBehaviourSubject().subscribe((loadedDefs) => {
				defs = Array.from(loadedDefs.values());
                console.log('defs: ', defs);
			})
		);
	});

	onDestroy(() => {
		for (const subscription of subscriptions) {
			subscription.unsubscribe();
		}
        subscriptions = [];
	});

	function onComponentDefinitionSelected(event: CustomEvent) {
		eventStore.set(
			new Event('ComponentDefinitionComponent', 'click', {
				componentDefinition: event.detail.componentDefinition
			})
		);
	}
	$: {
		let event = $eventStore;
		if (event != undefined && event.type == 'click') {
			if (event.source == 'ComponentDefinitionComponent') {
				selectedComponentDefinition = event.payload.componentDefinition;
			} else {
				selectedComponentDefinition = null;
			}
		}
	}
</script>

<ul class="h-full overflow-y-auto">
    {#each defs as def}
    <li class="h-16 p-2 border-b border-slate-200" class:selected={selectedComponentDefinition?.id == def.id}>
        <ComponentDefinitionComponent 
            on:componentDefinitonSelected={onComponentDefinitionSelected}
            {def}
        />
    </li>
    {/each}
</ul>

<style>
	.selected {
		@apply bg-blue-500;
	}
</style>
