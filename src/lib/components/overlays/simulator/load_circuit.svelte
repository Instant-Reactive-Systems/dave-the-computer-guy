<script lang="ts">
    import type { Circuit } from "$lib/models/circuit";
    import type { CircuitLoaderService } from "$lib/services/circuit_loader_service";
    import { CIRCUIT_LOADER_SERVICE } from "$lib/services/service";
    import type { Subscription } from "rxjs";
    import { getContext, onDestroy, onMount } from "svelte";

    export let onLoad: (circuit: Circuit) => void;

    let query: string = "";
    let circuits: Circuit[] = [];
    let subscriptions: Subscription[] = [];
    const circuitLoader: CircuitLoaderService = getContext(CIRCUIT_LOADER_SERVICE);

	onMount(() => {
		subscriptions.push(
			circuitLoader.getCircuitsBehaviourSubject().subscribe((loadedCircuits) => {
                circuits = Array.from(loadedCircuits.values());
			})
		);
	});

	onDestroy(() => {
		for (const subscription of subscriptions) {
			subscription.unsubscribe();
		}

        subscriptions = [];
	});

    function onClick(index: number) {
        onLoad(circuits[index]);
    }
</script>

<form on:submit|preventDefault>
    <div class="search">
        <h1>Load a saved circuit:</h1>
        <input on:keydown|stopPropagation placeholder="Filter circuit name" bind:value={query}/>
    </div>

    <ul class="circuit-list scroll-shadows-y">
        {#each circuits.filter(x => x.name.match(new RegExp(`.*${query}.*`, 'i'))) as circuit, i}
            <li><button on:click={() => onClick(i)}>
                <span>{circuit.name}</span>
                <span>{circuit.description}</span>
            </button></li>
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
        @apply py-2 px-4 w-full text-left transition-all duration-100 hover:border-l-4 hover:border-l-blue-400;
    }

    .circuit-list > li:last-child > button {
        @apply rounded-bl-lg;
    }
</style>


