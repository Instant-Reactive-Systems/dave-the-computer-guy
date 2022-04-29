<script lang="ts">
	import { Circuit, ComponentRenderingData, Junction } from '$lib/models/circuit';
	import { getContext, onDestroy, onMount } from 'svelte';
	import TabSystem from '$lib/components/tab_system.svelte';
	import PropertiesTab from '$lib/components/properties_tab.svelte';
	import ComponentsTab from '$lib/components/components_tab.svelte';
	import Canvas from '$lib/components/canvas.svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import {
		CIRCUIT_BUILDER_SERVICE,
		CIRCUIT_LOADER_SERVICE,
		SIMULATOR_SERVICE
	} from '$lib/services/service';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import { simulationStateStore } from '$lib/stores/simulation_state';
	import type { Command } from '$lib/models/command';
	import { get } from 'svelte/store';
	import { undoStore } from '$lib/stores/undo_store';
	import { redoStore } from '$lib/stores/redo_store';
	import _ from 'lodash';
	import type { Wire, DirectLink } from '$lib/models/wire';
	import { Connection } from '$lib/models/connection';
	import type { Connector } from '$lib/models/connector';
	import type { Subscription } from 'rxjs';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import type { UserEvent } from '$lib/models/user_event';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import { editorModeStore } from '$lib/stores/editor_mode';
	import { ComponentRef } from '$lib/models/component_ref';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
    import { bind } from 'svelte-simple-modal';
    import SaveCircuit from '$lib/components/overlays/simulator/save_circuit.svelte';
    import LoadCircuit from '$lib/components/overlays/simulator/load_circuit.svelte';

	type CircuitTab = {
		name: string;
		circuit: Circuit;
	};
	let circuit;

	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;
	let simulator: SimulatorService = getContext(SIMULATOR_SERVICE);
	let circuitLoader: CircuitLoaderService = getContext(CIRCUIT_LOADER_SERVICE);
	let circuitBuilder: CircuitBuilderService = getContext(CIRCUIT_BUILDER_SERVICE);
	let serviceSubscriptions: Subscription[] = [];
	let circuitDirty = true;

    
    const { open } = getContext('simple-modal');
    const openSaveCircuitModal = () => open(SaveCircuit, { onSend: (name: string, description: string) => {
        circuit.name = name;
        circuit.description = description;
        circuitLoader.insertCircuit(circuit, true);
    }});
    const openLoadCircuitModal = () => open(LoadCircuit, { onLoad: (circuit: Circuit) => {
        let newCircuitTab = {
			name: Math.random().toString(36).slice(-5),
			circuit: circuit,
		};
		circuitTabs = [...circuitTabs, newCircuitTab];
		currentCircuitTab = newCircuitTab;
        circuitStore.set(circuit);
    }});

	function createNewCircuit() {
		console.log('Creating new circuit');
		let newCircuitTab = {
			name: Math.random().toString(36).slice(-5),
			circuit: new Circuit()
		};
		circuitTabs = [...circuitTabs, newCircuitTab];
		currentCircuitTab = newCircuitTab;
	}

	$: {
		circuit = $circuitStore;
	}

	function saveCircuit() {
		if ($circuitStore == null) {
			console.log('Can not save circuit as no circuit is currently loaded.');
		} else {

			//showCircuitSaveModalForm();
			//circuitLoader.insertCircuit($circuit, true);
		}
	}

	function showCircuitSaveModalForm() {}

	function switchCircuitTab(tab: CircuitTab) {
		console.log('Switching circuit tab');
		currentCircuitTab = tab;
	}

	function loadCircuit() {
		console.log('Loading circuit');
	}

	function startSimulation() {
		const circuit = $circuitStore;
		if (circuit != null) {
			circuitBuilder.deductConnections(circuit).then((circ) => {
				circuitStore.set(circ);
				if ($simulationStateStore != 'RUNNING') {
					simulator.startSimulation();
					simulationStateStore.set('RUNNING');
				} else {
					console.log('Simulation already running');
				}
			});
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
		if (commandToUndo.redoable) {
			redoStack.push(commandToUndo);
		}
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
		if ($simulationStateStore != 'PAUSED') {
			simulator.stopSimulation();
			simulationStateStore.set('PAUSED');
		} else {
			console.log('Simulation already stopped');
		}
	}

	function stepSimulation() {
		simulator.stepSimulation();
		console.log('Step simulation');
	}

	function stopSimulation() {
		simulationStateStore.set('STOPPED');
		simulator.stopSimulation();
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
		const preCommandCircuit = $circuitStore;
		const addNewComponentCommand: Command = {
			name: 'AddNewComponent',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder
					.addNewComponent(circuit, definition, x, y)
					.then((circuit) => circuitStore.set(circuit));
			},
			undo: () => {
				circuitStore.set(preCommandCircuit);
			},
			redoable: true
		};
		addNewComponentCommand.do();
		addComandToUndoStack(addNewComponentCommand);
	}

	//returns the id of the new component which is calculated as the length of the current components in the circuit
	function getNewComponentId(): number {
		const circuit = $circuitStore;
		return circuit.components.length;
	}

	function moveComponent(event): void {
		console.log('Moving component');
		const preCommandCircuit = $circuitStore;
		const x = event.detail.x;
		const y = event.detail.y;
		const id = event.detail.componentId;
		const moveCommand: Command = {
			name: 'MoveComponent',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder.moveComponent(circuit, id, x, y).then((circ) => circuitStore.set(circ));
			},
			undo: () => {
				circuitStore.set(preCommandCircuit);
			},
			redoable: true
		};

		moveCommand.do();
		addComandToUndoStack(moveCommand);
	}

	function addComandToUndoStack(command: Command) {
		const undoCommandsStack = get(undoStore);
		undoCommandsStack.push(command);
		undoStore.set(undoCommandsStack);
	}

	//TODO handle undo and redo
	function addNewWire(e) {
		const preCommandCircuit = $circuitStore;
		const wire: Wire = e.detail.wire;
		const junction: Junction[] = e.detail.junction;

		const addNewWireCommand: Command = {
			name: 'Add new wire',
			do: () => {
				circuitBuilder.addNewWire(circuit, wire, junction).then((circ) => {
					const mode = _.cloneDeep(get(editorModeStore));
					if (mode.type == 'wire') {
						mode.data.lastX = wire.endX;
						mode.data.lastY = wire.endY;
					}
					editorModeStore.set(mode);
					circuitStore.set(circ);
				});
			},
			undo: () => {
				const mode = _.cloneDeep(get(editorModeStore));
				if (mode.type == 'wire') {
					mode.data.lastX = wire.startX;
					mode.data.lastY = wire.startY;
				}
				editorModeStore.set(mode);
				circuitStore.set(preCommandCircuit);
			},
			redoable: false
		};
		addNewWireCommand.do();
		addComandToUndoStack(addNewWireCommand);
	}

	function deleteComponent(circuit: Circuit, id: number) {
		console.log('Connector disconnecting not implemented');
	}

	function processUserEvent(e) {
		const event: UserEvent = e.detail.event;

		simulator.insertUserEvent(event);
	}

	$: {
		const circuit = currentCircuitTab?.circuit;
		console.log('Setting current circuit');
		circuitStore.set(circuit);
	}

	$: {
		console.log($circuitStore);
		const circuit = $circuitStore;
		if (circuit != null) {
			simulator.setCircuit(circuit);
		}
	}
	onMount(() => {
		createNewCircuit();
		serviceSubscriptions.push(
			simulator.getCircuitStateBehaviourSubject().subscribe((val) => {
				circuitStateStore.set(val);
			})
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
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
						<button on:click={openSaveCircuitModal}>Save circuit</button>
					</li>
					<li>
						<button on:click={openLoadCircuitModal}>Load circuit</button>
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
		<li class="pt-2 ">
			<button on:click={stopSimulation}>Stop</button>
		</li>
	</ul>

	<ul class="h-10 space-x-3">
		<p>{$editorModeStore.type}</p>
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
					on:userEventGenerated={processUserEvent}
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
