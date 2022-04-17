<script lang="ts">
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import type { Subscription } from 'rxjs';
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import ComponentDefinitionComponent from './component_definition.svelte';
	import { eventStore } from '$lib/stores/event_store';
	import { Event } from '$lib/models/event';

	let componentDefinitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	const subscriptions: Subscription[] = [];
	let defs = [];
	let selectedComponentDefinition: ComponentDefinition;
	onMount(() => {
		subscriptions.push(
			componentDefinitionLoaderService.getDefinitionsBehaviourSubject().subscribe((loadedDefs) => {
				defs = Array.from(loadedDefs.values());
			})
		);
	});

	onDestroy(() => {
		for (const subscription of subscriptions) {
			subscription.unsubscribe();
		}
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

<div class="mx-2 content">
	<VirtualList items={defs} let:item>
		<div class:selected={selectedComponentDefinition?.id == item.id}>
			<ComponentDefinitionComponent
				on:componentDefinitonSelected={onComponentDefinitionSelected}
				componentDefinition={item}
			/>
		</div>
	</VirtualList>
</div>

<style>
	th {
		@apply text-left;
	}
	td {
		@apply text-left;
	}
	.content {
		height: calc(100vh - 90px);
		/*
		Workaround so that virtuallist is full height, this needs to be refactored in the future
		*/
	}

	.selected {
		@apply bg-blue-600;
	}
</style>
