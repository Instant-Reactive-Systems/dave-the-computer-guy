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
				console.log('subbed', loadedCircuits);
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
    <h1>Load a saved circuit:</h1>
    <input on:keydown|stopPropagation placeholder="Search for circuit name" bind:value={query}/>

    <ul>
        {#each circuits.filter(x => x.name.match(new RegExp(`.*${query}.*`, 'i'))) as circuit, i}
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


