<script lang="ts">
	import { selectedComponentStore } from '$lib/stores/selected_component';
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import type { Subscription } from 'rxjs';
	import VirtualList from '@sveltejs/svelte-virtual-list';

	let selectedComponent = $selectedComponentStore;
	let componentDefinitionLoaderService: ComponentDefinitionLoaderService = getContext(COMPONENT_DEFINITION_LOADER_SERVICE);
	const subscriptions:Subscription[] = [];
	let defs:ComponentDefinition[] = [];
	onMount(()=>{
		subscriptions.push(componentDefinitionLoaderService.getDefinitionsBehaviourSubject().subscribe((loadedDefs) => {
			defs = Array.from(loadedDefs.values())
		}))

	})

	onDestroy(()=>{
		for(const subscription of subscriptions){
			subscription.unsubscribe();
		}
	})

	$:{
		console.log(defs);
	}

</script>

<div class="mx-2 content">
	<VirtualList items={defs} let:item>
		<p>item.name</p>
		<img class="w-30 h-20" src={item.metadata.imageUrl}/>
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
	

</style>
