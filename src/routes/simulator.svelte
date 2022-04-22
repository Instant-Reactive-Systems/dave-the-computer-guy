<script lang="ts">
	import { Circuit, Component, ComponentRenderingData, Junction } from '$lib/models/circuit';
	import { getContext, onDestroy, onMount } from 'svelte';
	import TabSystem from '$lib/components/tab_system.svelte';
	import PropertiesTab from '$lib/components/properties_tab.svelte';
	import ComponentsTab from '$lib/components/components_tab.svelte';
	import Canvas from '$lib/components/canvas.svelte';
	import NewCircuitDialog from '$lib/components/new_circuit_dialog.svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { SIMULATOR_SERVICE } from '$lib/services/service';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import { simulationStateStore } from '$lib/stores/simulation_state';
	import type { Command } from '$lib/models/command';
	import { get } from 'svelte/store';
	import { undoStore } from '$lib/stores/undo_store';
	import { redoStore } from '$lib/stores/redo_store';
	import _ from 'lodash';
	import type { WireRenderable } from '$lib/fabric/wire_renderable';
	import type { DirectLink, Wire } from '$lib/models/wire';
	import { Connection } from '$lib/models/connection';
	import type { Connector } from '$lib/models/connector';
import type { Subscription } from 'rxjs';

	type CircuitTab = {
		name: string;
		circuit: Circuit;
	};

	

	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;
	let simulator: SimulatorService = getContext(SIMULATOR_SERVICE);
	let serviceSubscriptions:Subscription[] = [];
	
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
		if ($simulationStateStore != 'RUNNING') {
			simulator.startSimulation();
			simulationStateStore.set('RUNNING');
		} else {
			console.log('Simulation already running');
		}
	}


	function undo() {
		const commandStack = get(undoStore);
		const commandToUndo: Command = commandStack.pop();
		if (commandToUndo != undefined) {
			commandToUndo.undo();
		} else {
			console.log('Undo stack empty');
			return;
		}
		undoStore.set(commandStack);
		const redoStack = get(redoStore);
		redoStack.push(commandToUndo);
		redoStore.set(redoStack);
	}

	function redo() {
		const redoStack = get(redoStore);
		const commandToRedo: Command = redoStack.pop();
		if (commandToRedo != undefined) {
			commandToRedo.do();
		} else {
			console.log('Redo stack empty');
			return;
		}
		redoStore.set(redoStack);
		const undoStack = get(undoStore);
		undoStack.push(commandToRedo);
		undoStore.set(undoStack);
	}

	function pauseSimulation() {
		if ($simulationStateStore != 'STOPPED') {
			simulator.stopSimulation();
			simulationStateStore.set('STOPPED');
		} else {
			console.log('Simulation already stopped');
		}
	}

	function stepSimulation() {
		simulator.stepSimulation();
	}

	function handleKeyPress(e: KeyboardEvent) {
		console.log(e);
		if (e.ctrlKey == true && e.key.toLowerCase() == 'z') {
			undo();
		}
		if (e.ctrlKey == true && e.key.toLowerCase() == 'y') {
			console.log('Redoing');
			redo();
		}
	}

	function addNewComponent(event) {
		console.log('Adding new component');
		const definition: ComponentDefinition = event.detail.componentDefinition;
		const x: number = event.detail.x;
		const y: number = event.detail.y;
		const id = getNewComponentId();
		const component = new Component(id, definition.id);

		const addNewComponentCommand: Command = {
			name: 'Add new component',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				const componentRenderingData = new ComponentRenderingData();
				componentRenderingData.x = x;
				componentRenderingData.y = y;
				componentRenderingData.id = id;
				circuit.metadata.rendering.components.push(componentRenderingData);
				circuit.components.push(component);
				circuitStore.set(circuit);
			},
			undo: () => {
				const circuit: Circuit = get(circuitStore);
				circuit.metadata.rendering.components.pop();
				circuit.components.pop();
				circuitStore.set(circuit);
			}
		};
		addNewComponentCommand.do();
		const undoCommandsStack = get(undoStore);
		undoCommandsStack.push(addNewComponentCommand);
		undoStore.set(undoCommandsStack);
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
		const componentRenderingData = new ComponentRenderingData();
		componentRenderingData.x = x;
		componentRenderingData.y = y;
		const circuit = $circuitStore;
		circuit.metadata.rendering.components[id] = componentRenderingData;
		disconnectConnectorsForComponent(circuit, id);
		circuitStore.set(circuit);
	}

	//TODO handle undo and redo
	function addNewWire(e) {
		console.log('Adding new wire');
		const circuit = $circuitStore;
		const wire: Wire = e.detail.wire;
		circuit.metadata.rendering.wires.push(wire);
		circuitStore.set(circuit);
		deductConnectionsFromWires();
	}

	function deductConnectionsFromWires() {
		const circuit = $circuitStore;
        circuit.connections = [];
		const wires = circuit.metadata.rendering.wires;
		//find wires that are connected to output pins

		const wiresWithOutputConnectors = [];
		for (const wire of wires) {
			const outputConnectors: DirectLink[] = wire.links.filter(
				(link) => link.type == 'pin' && (link.value as any).type == 'output'
			).map(link => (link.value as any).conn);
            if(outputConnectors.length != 0){
                wiresWithOutputConnectors.push([wire, outputConnectors]);
            }
		}

		for (const wireOutpinPinsTuple of wiresWithOutputConnectors) {
			const wire = wireOutpinPinsTuple[0] as Wire;
			const outputConnectors = wireOutpinPinsTuple[1];
			const inputConnectors = findAllConnectedInputConnectors(wire,[wire.id]);
			for (const connector of outputConnectors) {
                let connection = circuit.connections.find(conn => _.isEqual(connector,conn.from))
                if(connection == undefined){
                    connection = new Connection();
                    connection.from = connector;
                    connection.to = [...inputConnectors];
                    circuit.connections.push(connection);
                    console.log("debug connection making",wire,connection);
                }else{
                    connection.to = _.uniq([...connection.to,...inputConnectors]);
                }
            }
		}
        circuitStore.set(circuit);
	}

	function findAllConnectedInputConnectors(wire: Wire,idsToIgnore: number[]): Connector[] {
		const connectors: Connector[] = [];

        //find all wires or pins this component is connected to
		for (const link of wire.links) {
			if (link.type == 'pin' && (link.value as any).type == 'input') {
				connectors.push((link.value as any).conn);
			} else if (link.type == 'wire' && !idsToIgnore.includes(link.value as number)) {
                idsToIgnore.push(link.value as number);
				connectors.push(...findAllConnectedInputConnectors($circuitStore.metadata.rendering.wires[link.value as number],
                idsToIgnore));
			}
		}

        //find all wires which are connected to this wire
        for(const linkedWire of $circuitStore.metadata.rendering.wires){
            console.log("Here",linkedWire,idsToIgnore);
            const containsWire = linkedWire.links.some(link => link.type == "wire" && link.value as number == wire.id);
            if(containsWire && !idsToIgnore.includes(linkedWire.id)){
                idsToIgnore.push(linkedWire.id);
                connectors.push(...findAllConnectedInputConnectors(linkedWire,idsToIgnore));
            }
        }

        
		return _.uniq(connectors);
	}

	function addNewJunction(e) {
		const circuit = $circuitStore;
		const junction: Junction = new Junction();
		console.log('Junction', e);
		junction.sourceWire = e.detail.junction.sourceWire;
		junction.x = e.detail.junction.x;
		junction.y = e.detail.junction.y;
		circuit.metadata.rendering.junctions.push(junction);
		circuitStore.set(circuit);
	}

	function disconnectConnectorsForComponent(circuit: Circuit, id: number) {
		console.log('Connector disconnecting not implemented');
	}

	$: {
		const circuit = currentCircuitTab?.circuit;
		console.log('Setting current circuit');
		circuitStore.set(circuit);
	}

	$: {
		console.log($circuitStore);
		const circuit = $circuitStore;
		if(circuit != null){
		 	simulator.setCircuit(circuit);
		}
	}
	onMount(() => {
		createNewCircuit();
		serviceSubscriptions.push(simulator.getCircuitStateBehaviourSubject().subscribe((state) => console.log(`state`,state)));
	});

	onDestroy(() => {
		serviceSubscriptions.forEach(sub => sub.unsubscribe())
	})
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
				<Canvas
					on:componentMove={moveComponent}
					on:addNewComponent={addNewComponent}
					on:addNewWire={addNewWire}
					on:addNewJunction={addNewJunction}
				/>
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
<svelte:window on:keydown|preventDefault|trusted={handleKeyPress} />

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
