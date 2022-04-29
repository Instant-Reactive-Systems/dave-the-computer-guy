<script lang="ts">
    import type { Circuit } from "$lib/models/circuit";

    export let onLoad: (circuit: Circuit) => void;

    let query: string;
    let circuits: Circuit[];
    // TOOD: Figure out how to fetch circuits from the service (all at once or w/e)

    function onClick(index: number) {
        onLoad(circuits[index]);
    }
</script>

<form>
    <h1>Load a saved circuit:</h1>
    <input type="text" bind:value={query}/>

    <ul>
        {#each circuits as circuit, i}
            <li><button on:click={() => onClick(i)}>
                <span>{circuit.name}</span>
                <span>{circuit.description}</span>
            </button></li>
        {/each}
    </ul>
</form>

<style>

</style>


