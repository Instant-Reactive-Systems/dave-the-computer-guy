<script lang="ts">
	import { Circuit } from '$lib/models/circuit';
	import { getContext, onMount } from 'svelte';
    import TabSystem from '$lib/components/tab_system.svelte';
    import PropertiesTab from '$lib/components/properties_tab.svelte';
    import ComponentsTab from '$lib/components/components_tab.svelte';
    import Canvas from '$lib/components/canvas.svelte';
    import NewCircuitDialog from '$lib/components/new_circuit_dialog.svelte';
    import { circuitStore } from '$lib/stores/circuit';

	type CircuitTab = {
		name: string;
		circuit: Circuit;
	};

	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;


	function createNewCircuit() {
        console.log("Creating new circuit");
        let newCircuitTab = {
            name: Math.random().toString(36).slice(-5),
            circuit: new Circuit()
        }
        circuitTabs = [...circuitTabs,newCircuitTab];
        currentCircuitTab = newCircuitTab;
    }

	function saveCircuit() {
        console.log("Saving circuit");
    }

	function switchCircuitTab(tab: CircuitTab) {
        console.log("Switching circuit tab");
        currentCircuitTab = tab;
    }

	function loadCircuit() {
        console.log("Loading circuit");

    }

	function startSimulation() {}

	function pauseSimulation() {}

	function stepSimulation() {}

    function handleKeyPress(e:KeyboardEvent) {
        console.log(e);
    }

    $: {
        const circuit = currentCircuitTab?.circuit
        console.log("Setting current circuit");
        circuitStore.set(circuit);
    }
	onMount(() => {});
</script>




<nav id="app-tab-menu" class="shadow-md flex flex-row justify-between">
    <ul class="h-10">
        <li>
            <div class="tab-name">File</div>
            <div class="dropdown-menu">
                <ul>
                    <li>
                        <button on:click={createNewCircuit}>New circuit</button>
                    </li>
                    <li>
                        <button on:click={saveCircuit}>Save circuit</button>
                    </li>
                    <li>
                        <button on:click={loadCircuit}>Load circuit</button>
                    </li>
                </ul>
            </div>
        </li>
    </ul>

    <ul class="h-10 space-x-3">
        <li class="pt-2">
            <button on:click={startSimulation}>Start</button>
        </li>
        <li class="pt-2">
            <button on:click={pauseSimulation}>Pause</button>
        </li>
        <li class="pt-2 ">
            <button on:click={stepSimulation}>Step</button>
        </li>
    </ul>

    <div />
</nav>

<div id="main-content-wrapper" class="grid grid-cols-12">
    <div class="col-span-9">
        <div class=" h-full flex flex-col">
            <main id="canvas-wrapper" class="grow">
                <Canvas/>
            </main>
            <nav class="shadow-md">
                <ul class="h-10 flex flex-row">
                    {#each circuitTabs as tab (tab)}
                        <li class:selected="{tab.name == currentCircuitTab.name}" class="p-3 hover:bg-blue-500 hover:text-white">
                            <button on:click={() => switchCircuitTab(tab)}
                                >{tab.name}</button
                            >
                        </li>
                    {/each}
                </ul>
            </nav>
        </div>
    </div>
    <aside id="side-menu" class="col-span-3 shadow-xl border-l border-gray-200">
        <TabSystem
            tabs={[
                { title: "Components", innerComponent: ComponentsTab },
                { title: "Properties", innerComponent: PropertiesTab },
            ]}
        />
    </aside>
</div>
<svelte:window  on:keypress|trusted="{handleKeyPress}" />

<style>
    /*
    Top-level navbar styles
    */
    #app-tab-menu > ul {
        @apply inline-flex;
    }

    #app-tab-menu > ul > li {
        @apply h-full relative box-border;
    }

    #app-tab-menu > ul > li:first-child {
        @apply ml-4;
    }

    #app-tab-menu > ul > li > .tab-name {
        @apply px-4 h-full flex items-center cursor-default;
    }

    #app-tab-menu > ul > li:hover {
        @apply bg-blue-500 text-white;
    }

    /*
    Dropdown menu styles
    */
    .dropdown-menu {
        @apply invisible box-border absolute z-50 bg-white text-black border-blue-500 border-l-2 shadow-md;
    }

    li:hover > .dropdown-menu {
        @apply visible;
    }

    .dropdown-menu > ul > li:hover {
        @apply bg-blue-500 text-white;
    }

    .dropdown-menu > ul > li > button {
        @apply px-2 py-2 flex items-start w-max;
    }

    .selected {
        @apply bg-blue-400;
    }

    /*
    Main content styles
    */
    #main-content-wrapper {
        --hgt: calc(theme(height.screen) - theme(height.10));
        height: var(--hgt);
        max-height: var(--hgt);
        min-height: var(--hgt);
    }


</style>

