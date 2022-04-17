<script lang="ts">
	import { Circuit, Component } from '$lib/models/circuit';
	import { getContext, onMount } from 'svelte';
	import TabSystem from '$lib/components/tab_system.svelte';
	import PropertiesTab from '$lib/components/properties_tab.svelte';
	import ComponentsTab from '$lib/components/components_tab.svelte';
	import Canvas from '$lib/components/canvas.svelte';
	import NewCircuitDialog from '$lib/components/new_circuit_dialog.svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { SIMULATOR_SERVICE } from '$lib/services/service';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import type { ComponentDefinition } from '$lib/models/component_definition';

	type CircuitTab = {
		name: string;
		circuit: Circuit;
	};

	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;
	let simulator: SimulatorService = getContext(SIMULATOR_SERVICE);

	function createNewCircuit() {
		console.log('Creating new circuit');
		let newCircuitTab = {
			name: Math.random().toString(36).slice(-5),
			circuit: new Circuit()
		};
		circuitTabs = [...circuitTabs, newCircuitTab];
		currentCircuitTab = newCircuitTab;
	}

	function saveCircuit() {
		console.log('Saving circuit');
	}

	function switchCircuitTab(tab: CircuitTab) {
		console.log('Switching circuit tab');
		currentCircuitTab = tab;
	}

	function loadCircuit() {
		console.log('Loading circuit');
	}

	function startSimulation() {
		simulator.startSimulation();
	}

	function pauseSimulation() {
		simulator.stopSimulation();
	}

	function stepSimulation() {
		simulator.stepSimulation();
	}

	function handleKeyPress(e: KeyboardEvent) {
		console.log(e);
	}

	function addNewComponent(event) {
		console.log('Addingn new component');
		const definition: ComponentDefinition = event.detail.componentDefinition;
		const x: number = event.detail.x;
		const y: number = event.detail.y;
		const id = getNewComponentId();
		const component = new Component(id, definition.id);
		const circuit = $circuitStore;
		console.log(circuit);
		circuit.metadata.rendering.components.set(id, { x: x, y: y });
		circuit.components.push(component);
		circuitStore.set(circuit);
		console.log(circuit);
	}

	//returns the id of the new component which is calculated as the length of the current components in the circuit
	function getNewComponentId(): number {
		const circuit = $circuitStore;
		return circuit.components.length;
	}

	function moveComponent(event): void {
		const x = event.detail.x;
		const y = event.detail.y;
		const id = event.detail.componentId;
		const circuit = $circuitStore;
		circuit.metadata.rendering.components.set(id, { x: x, y: y });
		disconnectConnectorsForComponent(circuit,id);
        circuitStore.set(circuit);
	}

	function disconnectConnectorsForComponent(circuit: Circuit,id: number) {
		console.log('Connector disconnecting not implemented');
	}

	$: {
		const circuit = currentCircuitTab?.circuit;
		console.log('Setting current circuit');
		circuitStore.set(circuit);
	}
	onMount(() => {
		createNewCircuit();
	});
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
				<Canvas on:componentMove={moveComponent} on:addNewComponent={addNewComponent} />
			</main>
			<nav class="shadow-md">
				<ul class="h-10 flex flex-row">
					{#each circuitTabs as tab (tab)}
						<li
							class:selected={tab.name == currentCircuitTab.name}
							class="p-3 hover:bg-blue-500 hover:text-white"
						>
							<button on:click={() => switchCircuitTab(tab)}>{tab.name}</button>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
	<aside id="side-menu" class="col-span-3 shadow-xl border-l border-gray-200">
		<TabSystem
			tabs={[
				{ title: 'Components', innerComponent: ComponentsTab },
				{ title: 'Properties', innerComponent: PropertiesTab }
			]}
		/>
	</aside>
</div>
<svelte:window on:keypress|trusted={handleKeyPress} />

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
