<script lang="ts">
    import type { Circuit } from "$lib/models/circuit";
    import type { CircuitLoaderService } from "$lib/services/circuit_loader_service";
    import { CIRCUIT_LOADER_SERVICE } from "$lib/services/service";
    import type { Subscription } from "rxjs";
    import { getContext, onDestroy, onMount } from "svelte";
    import CloseIcon from '$lib/icons/close.svelte';

    // Props
    export let onLoad: (circuit: Circuit) => void;

    // Services
    const circuitLoader: CircuitLoaderService = getContext(CIRCUIT_LOADER_SERVICE);

    // Variables
    let query: string = '';
    let circuits: Circuit[] = [];
    let subs: Subscription[] = [];

    // Logic
    function onCircuitSelect(circuit: Circuit) {
        onLoad(circuit);
    }

    function deleteCircuit(circuit: Circuit) {
        circuitLoader.deleteCircuit(circuit.id);
    }

    // Component lifetime
	onMount(() => {
		subs.push(
			circuitLoader.getCircuitsBehaviourSubject().subscribe((loadedCircuits) => {
                circuits = Array.from(loadedCircuits.values());
			})
		);
	});

	onDestroy(() => {
        subs.forEach((sub) => sub.unsubscribe());
	});
</script>

<form on:submit|preventDefault>
    <div class="search">
        <h1>Load a saved circuit:</h1>
        <input on:keydown|stopPropagation placeholder="Filter circuit name" bind:value={query}/>
    </div>

    <ul class="circuit-list scroll-shadows-y">
        {#each circuits.filter(x => x.name.match(new RegExp(`.*${query}.*`, 'i'))) as circuit}
        <li>
            <button on:click={() => onCircuitSelect(circuit)}>
                <div class="circuit-info">
                    <span class="circuit-name">{circuit.name}</span>
                    <span class="circuit-desc">{circuit.description != '' ? circuit.description : 'No description.'}</span>
                </div>
                <button on:click|stopPropagation={() => deleteCircuit(circuit)} class="close-btn">
                    <CloseIcon/>
                </button>
            </button>
        </li>
        {:else}
            <span>No circuits found.</span>
        {/each}
    </ul>
</form>

<style>
    .search {
        @apply space-x-2 pb-2 mb-4 border-b border-slate-300;
    }

    .search > * {
        @apply inline-block;
    }

    .search > h1 {
        @apply text-lg font-bold;
    }

    .search > input {
        @apply px-2;
    }

    .circuit-list {
        @apply max-h-48 overflow-y-auto text-center;
    }

    .circuit-list > span {
        @apply text-lg w-full;
    }

    .circuit-list > li {
        @apply border-x border-x-slate-300;
    }

    .circuit-list > li:not(:last-child) {
        @apply border-b border-b-slate-200;
    }

    .circuit-list > li:last-child {
        @apply rounded-b-lg border-b border-b-slate-300;
    }

    .circuit-list > li > button {
        @apply py-2 px-4 w-full flex items-center select-none transition-all duration-100 hover:border-l-4 hover:border-l-blue-400;
    }

    .circuit-list > li:last-child > button {
        @apply rounded-bl-lg;
    }

    .circuit-info {
        @apply text-left space-x-2 truncate;
    }

    .close-btn {
        @apply shrink invisible rounded-md hover:bg-slate-300 hover:opacity-50;
    }

	.circuit-list > li > button:hover > .close-btn {
		@apply visible;
	}

    .circuit-info {
        @apply flex-1;
    }

    .circuit-name {
        @apply font-semibold;
    }

    .circuit-desc {
        @apply text-slate-400;
    }
</style>


