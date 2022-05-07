<script lang="ts">
	import {type Circuit, DEFAULT_CIRCUIT, type Junction } from '$lib/models/circuit';
	import { getContext, onDestroy, onMount } from 'svelte';
	import TabSystem from '$lib/components/tab_system.svelte';
	import PropertiesTab from '$lib/components/properties_tab.svelte';
	import ComponentsTab from '$lib/components/components_tab.svelte';
	import Canvas from '$lib/components/canvas.svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import {
		CIRCUIT_BUILDER_SERVICE,
		CIRCUIT_LOADER_SERVICE,
		COMPONENT_DEFINITION_LOADER_SERVICE,
		SIMULATOR_SERVICE
	} from '$lib/services/service';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { Command } from '$lib/models/command';
	import { get } from 'svelte/store';	import _, { clone } from 'lodash';
	import type { Wire } from '$lib/models/wire';
	import type { Subscription } from 'rxjs';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import type { UserEvent } from '$lib/models/user_event';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import { editorModeStore } from '$lib/stores/editor_mode';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
	import {
		type EditorModeType,
		DEFAULT_DELETE_MODE,
		DEFAULT_WIRE_MODE,
		DEFAULT_EDIT_MODE,
		DEFAULT_RUNNING_MODE,
		DEFAULT_PAUSED_MODE,
type WireData
	} from '$lib/models/editor_mode';
	import Notifier from '$lib/util/notifier';
	import SaveCircuit from '$lib/components/overlays/simulator/save_circuit.svelte';
	import LoadCircuit from '$lib/components/overlays/simulator/load_circuit.svelte';
	import PlayIcon from '$lib/icons/play.svelte';
	import PauseIcon from '$lib/icons/pause.svelte';
	import StopIcon from '$lib/icons/stop.svelte';
	import StepIcon from '$lib/icons/step.svelte';
	import EditIcon from '$lib/icons/edit.svelte';
	import DeleteIcon from '$lib/icons/delete.svelte';
	import WireIcon from '$lib/icons/wire.svelte';
	import QuestIcon from '$lib/icons/quest.svelte';
	import TutorialIcon from '$lib/icons/tutorial.svelte';
	import { getNotificationsContext } from 'svelte-notifications';
	import ExportTab from '$lib/components/export_tab.svelte';
    import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
import { copy } from '$lib/util/common';

	const { open, close } = getContext('simple-modal');
	const notifier = new Notifier(getNotificationsContext());

	type CircuitTab = {
		name: string;
		circuit: Circuit;
		undoStack: Command[],
		redoStack: Command[]
	};

	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;
	let simulator: SimulatorService = getContext(SIMULATOR_SERVICE);
	let circuitLoader: CircuitLoaderService = getContext(CIRCUIT_LOADER_SERVICE);
	let defLoader: ComponentDefinitionLoaderService = getContext(COMPONENT_DEFINITION_LOADER_SERVICE);
	let circuitBuilder: CircuitBuilderService = getContext(CIRCUIT_BUILDER_SERVICE);
	let serviceSubscriptions: Subscription[] = [];
	let isInSimulation = false;
	let isExporting = false;

	function openSaveCircuitModal() {
		open(SaveCircuit, {
			onSend: (name: string, description: string) => {
				const circuit = $circuitStore;
                console.log('double nigger circuit: ', circuit);
				circuit.name = name;
				circuit.description = description;
				circuitLoader.insertCircuit(circuit).then((circ) => {
					console.log('Loaded circuit: ', circ);
					currentCircuitTab.name = name;
					currentCircuitTab.circuit = circ;
					circuitTabs = circuitTabs;
					currentCircuitTab = currentCircuitTab;
				});
				close();
			}
		});
	}

	function openLoadCircuitModal() {
		open(LoadCircuit, {
			onLoad: (circuit: Circuit) => {
				// Load opened tab
				const found = circuitTabs.find((x) => x.circuit.id == circuit.id);
				if (found != null) {
					currentCircuitTab = found;
					circuitTabs = circuitTabs;
					close();
					return;
				}

				// Open new tab
				let newCircuitTab = {
					name: circuit.name,
					circuit: circuit,
					undoStack: [] as Command[],
					redoStack: [] as Command[]
				};
				circuitTabs = [...circuitTabs, newCircuitTab];
				currentCircuitTab = newCircuitTab;
				close();
			}
		});
	}

	function startExportCircuit() {
		isExporting = true;
	}

	function createNewCircuit() {
		console.log('Creating new circuit');
		let newCircuitTab = {
			name: Math.random().toString(36).slice(-5),
			circuit: copy(DEFAULT_CIRCUIT),
			undoStack: [] as Command[],
			redoStack: [] as Command[]
		};
		circuitTabs = [...circuitTabs, newCircuitTab];
		currentCircuitTab = newCircuitTab;
	}

	function switchCircuitTab(tab: CircuitTab) {
		console.log('Switching circuit tab');
		currentCircuitTab = tab;
	}

	function undo() {
		const commandToUndo: Command = currentCircuitTab.undoStack.pop();
		if (commandToUndo != undefined) {
			commandToUndo.undo();
		} else {
			console.log('Undo stack empty');
			return;
		}
		if (commandToUndo.redoable) {
			currentCircuitTab.redoStack.push(commandToUndo);
		}
	}

	function redo() {
		const commandToRedo: Command = currentCircuitTab.redoStack.pop();
		if (commandToRedo != undefined) {
			commandToRedo.do();
		} else {
			console.log('Redo stack empty');
			return;
		}
		currentCircuitTab.undoStack.push(commandToRedo);
	}

	function startSimulation() {
		deductConnections().then((circuit) => {
			switch ($editorModeStore.type) {
				case 'edit':
				case 'wire':
				case 'delete':
					circuitStore.set(circuit);
					editorModeStore.set(DEFAULT_RUNNING_MODE);
					simulator.setCircuit(circuit);
					simulator.start();
					break;
				case 'paused': {
					simulator.start();
					editorModeStore.set(DEFAULT_RUNNING_MODE);
					break;
				}
				default: {
					notifier.info('Simulation already running!');
				}
			}
		});
	}

	function pauseSimulation() {
		switch ($editorModeStore.type) {
			case 'running': {
				simulator.pause();
				editorModeStore.set(DEFAULT_PAUSED_MODE);
				break;
			}
			case 'paused': {
				console.log('Simulation already paused!');
				break;
			}
			default: {
				console.log('Simulation not running!');
			}
		}
	}

	function deleteWire(e) {
		const circuit = $circuitStore;
		const wireId = e.detail.wireId;
		console.log(`Deleting wire ${wireId}`);
		circuitBuilder.deleteWire(circuit, wireId).then((circuit) => circuitStore.set(circuit));
	}

	function deleteComponent(e) {
		const componentId = e.detail.componentId;
		const circuit = $circuitStore;
		console.log(`Deleting component ${componentId}`);
		circuitBuilder
			.deleteComponent(circuit, componentId)
			.then((circuit) => circuitStore.set(circuit));
	}

	function stopSimulation() {
		switch ($editorModeStore.type) {
			case 'paused':
			case 'running': {
				simulator.stop();
				editorModeStore.set(copy(DEFAULT_EDIT_MODE));
				circuitStateStore.set(null); // Remove simulation visuals
				break;
			}
			default: {
				console.log('Simulation not running!');
			}
		}
	}

	function stepSimulation() {
		switch ($editorModeStore.type) {
			case 'paused': {
				simulator.step();
				break;
			}
			case 'running': {
				console.log('Can not step while simulator is rurnning');
				break;
			}
			default: {
				deductConnections().then((circuit) => {
					circuitStore.set(circuit);
					simulator.setCircuit(circuit);
					simulator.step();
					editorModeStore.set(copy(DEFAULT_PAUSED_MODE));
				});
			}
		}
	}

	function deductConnections(): Promise<Circuit> {
		const circuit = $circuitStore;
		return circuitBuilder.deductConnections(circuit);
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.ctrlKey == true && e.key.toLowerCase() == 'z') {
			undo();
			e.preventDefault();
		}
		if (e.ctrlKey == true && e.key.toLowerCase() == 'y') {
			console.log('Redoing');
			redo();
			e.preventDefault();
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
			redoable: false
		};
		addNewComponentCommand.do();
		addComandToUndoStack(addNewComponentCommand);
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
		currentCircuitTab.undoStack.push(command);
	}

	//TODO handle undo and redo
	function addNewWire(e) {
		const preCommandCircuit = $circuitStore;
		const wire: Wire = e.detail.wire;
		const junction: Junction[] = e.detail.junction;

		const addNewWireCommand: Command = {
			name: 'Add new wire',
			do: () => {
				const circuit = $circuitStore;
				circuitBuilder.addNewWire(circuit, wire, junction).then((circ) => {
					const mode = clone(get(editorModeStore));
					if (mode.type == 'wire') {
						(mode.data as WireData).lastX = wire.endX;
						(mode.data as WireData).lastY = wire.endY;
					}
					editorModeStore.set(mode);
					circuitStore.set(circ);
				});
			},
			undo: () => {
				const mode = clone(get(editorModeStore));
				if (mode.type == 'wire') {
					(mode.data as WireData).lastX = wire.startX;
					(mode.data as WireData).lastY = wire.startY;
				}
				editorModeStore.set(mode);
				circuitStore.set(preCommandCircuit);
			},
			redoable: false
		};
		addNewWireCommand.do();
		addComandToUndoStack(addNewWireCommand);
	}

	function processUserEvent(e) {
		const event: UserEvent = e.detail.event;
		simulator.insertUserEvent(event);
	}

	function switchEditorMode(type: EditorModeType) {
		switch (type) {
			case 'delete':
				$editorModeStore = DEFAULT_DELETE_MODE;
				break;
			case 'wire':
				$editorModeStore = DEFAULT_WIRE_MODE;
				break;
			case 'edit':
				$editorModeStore = DEFAULT_EDIT_MODE;
				break;
		}
	}

	function exportCircuit(event: CustomEvent<{ definition: ComponentDefinition }>) {
		console.log('Exported: ', event.detail.definition);
		isExporting = false;
        defLoader.insertDefinition(event.detail.definition, true);
	}

	function cancelExport() {
		console.log('Cancelled exporting: ');
		isExporting = false;
	}

	function updateCircuitTab(circuit: Circuit) {
		if (currentCircuitTab != null && circuit != null) {
			currentCircuitTab.circuit = circuit;
		}
	}

	$: {
		const circuit = currentCircuitTab?.circuit;
        console.log('nigger circuit: ', circuit);
		circuitStore.set(circuit);
	}

	$: {
		const circuit = $circuitStore;
		updateCircuitTab(circuit);
	}

	// Set 'isInSimulation' state to disable controls based on editor mode
	$: {
		const mode = $editorModeStore;
		switch (mode.type) {
			case 'paused':
			case 'running':
				isInSimulation = true;
				break;
			default:
				isInSimulation = false;
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

<nav id="toolbar" class="shadow-md inline-flex w-full">
	<ul class="app-tab-menu">
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
					<li>
						<button on:click={startExportCircuit}>Export as component</button>
					</li>
				</ul>
			</div>
		</li>
	</ul>
	<ul class="sim-tools">
		<li>
			<button on:click={stopSimulation} title="Stop">
				<StopIcon />
			</button>
		</li>
		<li>
			<button on:click={pauseSimulation} title="Pause">
				<PauseIcon />
			</button>
		</li>
		<li>
			<button on:click={startSimulation} title="Start">
				<PlayIcon />
			</button>
		</li>
		<li>
			<button on:click={stepSimulation} title="Step">
				<StepIcon />
			</button>
		</li>
	</ul>
	<ul class="editor-tools">
		<li>
			<button on:click={() => switchEditorMode('edit')} disabled={isInSimulation} title="Edit mode">
				<EditIcon />
			</button>
		</li>
		<li>
			<button on:click={() => switchEditorMode('wire')} disabled={isInSimulation} title="Wire mode">
				<WireIcon />
			</button>
		</li>
		<li>
			<button
				on:click={() => switchEditorMode('delete')}
				disabled={isInSimulation}
				title="Delete mode"
			>
				<DeleteIcon />
			</button>
		</li>
	</ul>
	<ul class="game-tools">
		<li>
			<button on:click={() => {}} title="Quests">
				<QuestIcon />
			</button>
		</li>
		<li>
			<button on:click={() => {}} title="Tutorial">
				<TutorialIcon />
			</button>
		</li>
	</ul>
</nav>

<div id="main-content-wrapper" class="grid grid-cols-12">
	<div class="col-span-9">
		<div class="h-full flex flex-col">
			<main id="canvas-wrapper">
				<Canvas
					on:componentMove={moveComponent}
					on:addNewComponent={addNewComponent}
					on:addNewWire={addNewWire}
					on:userEventGenerated={processUserEvent}
					on:deleteWire={deleteWire}
					on:deleteComponent={deleteComponent}
				/>
			</main>
			<div class="bottom-bar">
				<div
					class="editor-mode"
					class:editmode={$editorModeStore.type == 'edit'}
					class:wiremode={$editorModeStore.type == 'wire'}
					class:delmode={$editorModeStore.type == 'delete'}
					class:runningmode={$editorModeStore.type == 'running'}
					class:pausedmode={$editorModeStore.type == 'paused'}
					title="Editor mode"
				>
					{$editorModeStore.type}
				</div>
				<nav class="circuit-tabs scroll-shadows-x">
					<ul>
						{#each circuitTabs as tab (tab)}
							<li class:selected={tab.name == currentCircuitTab.name}>
								<button on:click={() => switchCircuitTab(tab)}>
									{tab.name}
								</button>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
	</div>
	<aside id="side-menu" class="aside col-span-3">
		{#if isExporting}
			<ExportTab on:cancelExport={cancelExport} on:export={exportCircuit} />
		{:else}
			<TabSystem
				tabs={[
					{ title: 'Components', innerComponent: ComponentsTab },
					{ title: 'Properties', innerComponent: PropertiesTab }
				]}
			/>
		{/if}
	</aside>
</div>
<svelte:window on:keydown|trusted={handleKeyPress} />

<style>
	/*
    Top-level navbar styles
    */
	#toolbar {
		@apply h-10;
	}

	#toolbar > ul {
		@apply inline-flex;
	}

	#toolbar > ul > li:hover {
		@apply bg-blue-400 text-white;
	}

	.app-tab-menu {
		@apply mx-4;
	}

	.app-tab-menu > li {
		@apply h-full relative box-border;
	}

	.app-tab-menu > li > .tab-name {
		@apply px-4 h-full flex items-center cursor-default;
	}

	.sim-tools {
		@apply pl-4 border-l border-blue-400;
	}

	.sim-tools > li > button {
		@apply p-2;
	}

	.editor-tools {
		@apply pl-4 ml-4 border-l border-slate-300;
	}

	.editor-tools > li > button {
		@apply p-2 disabled:cursor-not-allowed;
	}

	.game-tools {
		@apply mr-4 w-full justify-end;
	}

	.game-tools > li > button {
		@apply p-2;
	}

	/*
    Dropdown menu styles
    */
	.dropdown-menu {
		@apply invisible box-border absolute z-50 bg-white text-black border-blue-400 border-l-2 shadow-md;
	}

	li:hover > .dropdown-menu {
		@apply visible;
	}

	.dropdown-menu > ul > li:hover {
		@apply bg-blue-400 text-white;
	}

	.dropdown-menu > ul > li > button {
		@apply px-2 py-2 flex items-start w-max;
	}

	/*
    Selected
    */
	.selected {
		@apply border-blue-400 !important;
	}

	/*
    Editor mode styles
    */
	.editor-mode {
		@apply px-4 py-2 uppercase text-lg font-bold;
	}

	.editmode {
		@apply bg-yellow-500;
	}

	.wiremode {
		@apply bg-purple-700;
	}

	.delmode {
		@apply bg-red-700;
	}

	.runningmode {
		@apply bg-blue-300;
	}

	.pausedmode {
		@apply bg-green-400;
	}

	/*Bottom bar*/
	.bottom-bar {
		@apply inline-flex;
	}

	.bottom-bar > * {
		@apply h-10;
	}

	.circuit-tabs {
		@apply grow overflow-x-auto overflow-y-clip border-t-2 border-gray-200;
	}

	.circuit-tabs > ul {
		@apply inline-flex;
	}

	.circuit-tabs > ul > li {
		@apply border-t-2 border-white hover:bg-blue-400 hover:text-white hover:border-blue-400;
	}

	.circuit-tabs > ul > li > button {
		@apply px-4 py-2;
	}

	/*Aside*/
	.aside {
		--hgt: calc(theme(height.full));
		height: var(--hgt);
		max-height: var(--hgt);
		min-height: var(--hgt);
		@apply border-l-2 border-gray-200;
	}

	/*Main content styles*/
	#main-content-wrapper {
		--hgt: calc(theme(height.screen) - theme(height.10));
		height: var(--hgt);
		max-height: var(--hgt);
		min-height: var(--hgt);
	}

	#canvas-wrapper {
		@apply grow;
	}
</style>
