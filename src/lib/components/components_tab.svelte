<script lang="ts">
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import type { Subscription } from 'rxjs';
	import { eventStore } from '$lib/stores/event_store';
    import { on_keydown } from '$lib/util/key_handling';
    import CloseIcon from '$lib/icons/close.svelte';

    // Services
	const defLoader: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);

    // Variables
	let selectedDef: ComponentDefinition;
	let defs: ComponentDefinition[] = [];
	let subs: Subscription[] = [];

    // Logic
    function onSelectedDef(def: ComponentDefinition) {
        selectedDef = def;
		eventStore.set({
			source: 'ComponentDefinitionComponent',
			type: 'click',
			payload: {
				componentDefinition: selectedDef,
			},
		});
	}

    function onKeydown(event: KeyboardEvent) {
        if (event.key == 'Escape') {
            selectedDef = null;
        }
    }

    function deleteDef(def: ComponentDefinition) {
        defLoader.deleteDefinition(def.id);
    }

	$: {
		const event = $eventStore;
		if (event != undefined && event.type == 'click') {
			if (event.source == 'ComponentDefinitionComponent') {
				selectedDef = event.payload.componentDefinition;
			} else {
				selectedDef = null;
			}
		}
	}

    // Component lifetime
	onMount(() => {
		subs.push(
			defLoader.getDefinitionsBehaviourSubject().subscribe((loadedDefs) => {
				defs = Array.from(loadedDefs.values());
			})
		);
	});

	onDestroy(() => {
        subs.forEach((sub) => sub.unsubscribe());
	});
</script>

<ul class="def-list" use:on_keydown={onKeydown}>
    {#each defs as def (def.id)}
    <li class:selected={selectedDef?.id == def.id}>
        <button on:click={() => onSelectedDef(def)}>
            <div class="def-info">
                <h1>{def.name}</h1>
                <!--<img class="w-1/2 h-1/2" src={def.metadata.imageUrl}/>-->
            </div>
            {#if def.type != 'Builtin'}
                <button on:click|stopPropagation={() => deleteDef(def)} class="close-btn">
                    <CloseIcon/>
                </button>
            {/if}
        </button>
    </li>
    {/each}
</ul>

<style>
    .def-list {
        @apply h-full overflow-y-auto;
    }

    .def-list > li {
        @apply border-b border-slate-200 hover:bg-slate-100 cursor-pointer;
    }

    .def-list > li > button {
        @apply py-2 px-4 w-full flex flex-row;
    }

    .def-list > li > button:hover > .close-btn {
        @apply visible;
    }

    .def-info {
        @apply flex-1 flex justify-start;
    }
    
    .def-info > h1 {
        @apply font-bold;
    }

    .close-btn {
        @apply shrink invisible rounded-md hover:bg-slate-300 hover:opacity-50;
    }

	.selected {
		@apply border-l-4 border-l-blue-400 transition-[border-left] duration-100 !important;
	}
</style>
