<script lang="ts">
    import type { Circuit } from "$lib/models/circuit";
    import type { CircuitLoaderService } from "$lib/services/circuit_loader_service";
    import { CIRCUIT_LOADER_SERVICE } from "$lib/services/service";
    import type { Subscription } from "rxjs";
    import { getContext, onDestroy, onMount } from "svelte";

    export let onLoad: (circuit: Circuit) => void;

    let query: string;
    let circuits: Circuit[] = [];
    let filteredCircuits: Circuit[] = [];
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

    $: {
        let filteredCircuits = [];
        for (const circuit of circuits) {
            const re = `.*${query}.*`;
            if (circuit.name.match(re)) filteredCircuits.push(circuit);
        }
    }

    function onClick(index: number) {
        onLoad(circuits[index]);
    }
</script>

<form>
    <h1>Load a saved circuit:</h1>
    <input type="text" bind:value={query}/>

    <ul>
        {#each filteredCircuits as circuit, i}
            <li><button on:click={() => onClick(i)}>
                <span>{circuit.name}</span>
                <span>{circuit.description}</span>
            </button></li>
        {:else}
            <span>No circuits available.</span>
        {/each}
    </ul>
</form>

<style>

</style>


