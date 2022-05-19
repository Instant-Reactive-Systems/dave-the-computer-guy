<script lang="ts">
	import type { Circuit, Junction } from '$lib/models/circuit';
	import { defaultCircuit } from '$lib/models/circuit';
	import { getContext, onDestroy, onMount, tick } from 'svelte';
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
	import { get } from 'svelte/store';
	import _, { clone, update } from 'lodash';
	import type { Wire } from '$lib/models/wire';
	import type { Subscription } from 'rxjs';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import type { UserEvent } from '$lib/models/user_event';
	import { actionToString } from '$lib/models/action';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import { editorModeStore } from '$lib/stores/editor_mode';
	import { actionStore } from '$lib/stores/action_store';
    import { componentStore } from '$lib/stores/component_store';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
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
	import CloseIcon from '$lib/icons/close.svelte';
	import NavigationIcon from '$lib/icons/navigation.svelte';
	import SettingsIcon from '$lib/icons/settings.svelte';
	import { getNotificationsContext } from 'svelte-notifications';
	import ExportTab from '$lib/components/export_tab.svelte';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import {
		defaultDeleteMode,
		defaultEditorMode,
		defaultPausedMode,
		defaultRunningMode,
		defaultWireMode,
		type EditorMode,
		type EditorModeType,
		type WireData
	} from '$lib/models/editor_mode';
	import Notifier from '$lib/util/notifier';
    import NavigationPanel from '$lib/components/overlays/navigation_panel.svelte';
    import QuestsPanel from '$lib/components/overlays/quests_panel.svelte';
    import TutorialPanel from '$lib/components/overlays/tutorial_panel.svelte';
    import SettingsPanel from '$lib/components/overlays/simulator/settings.svelte';
    import type { SimulationSettings } from '$lib/models/simulation_settings';

	// Types
	type CircuitTab = {
		name: string;
		circuit: Circuit;
		undoStack: Command[];
		redoStack: Command[];
	};

	// Services
	const simulator: SimulatorService = getContext(SIMULATOR_SERVICE);
	const circuitLoader: CircuitLoaderService = getContext(CIRCUIT_LOADER_SERVICE);
	const defLoader: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	const circuitBuilder: CircuitBuilderService = getContext(CIRCUIT_BUILDER_SERVICE);

	// Variables
	const { open, close } = getContext('simple-modal');
	const notifier: Notifier = new Notifier(getNotificationsContext());
	let circuitTabs: CircuitTab[] = [];
	let currentCircuitTab: CircuitTab;
	let serviceSubscriptions: Subscription[] = [];
	let isInSimulation = false;
	let isExporting = false;

	// Logic
	function openSaveCircuitModal() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot save circuit while running the simulation.');
			return;
		}

		open(SaveCircuit, {
			onSend: (name: string, description: string) => {
				const circuit = $circuitStore;
				circuit.name = name;
				circuit.description = description;
				circuitLoader.insertCircuit(circuit).then((circ) => {
					currentCircuitTab.name = name;
					currentCircuitTab.circuit = circ;
					circuitTabs = circuitTabs;
					currentCircuitTab = currentCircuitTab;
                    componentStore.set(null);
				});
				actionStore.set({
					type: 'circuit-save',
					data: {
						name
					}
				});
				close();
			}
		});
	}

	function openLoadCircuitModal() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot load circuit while running the simulation.');
			return;
		}

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
                actionStore.set({
                    type: 'circuit-load',
                    data: {
                        name: circuit.name,
                    },
                });
                componentStore.set(null);
				close();
			}
		});
	}

	function openNavigationModal() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot navigate through rooms while running the simulation.');
			return;
		}

		open(NavigationPanel);
	}

	function openQuestsModal() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot open quests while running the simulation.');
			return;
		}

		open(
			QuestsPanel,
			{},
			{
				styleWindow: {
					width: 'auto',
					overflow: 'hidden'
				}
			}
		);
	}

	function openTutorialModal() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot open tutorial while running the simulation.');
			return;
		}

		open(
			TutorialPanel,
			{},
			{
				styleWindow: {
					width: 'auto',
					overflow: 'hidden'
				}
			}
		);
	}

    function openSettingsModal() {
        open(SettingsPanel, {onSave: (settings: SimulationSettings) => {
            // There is a race here that is unlikely to occur unless 
            // the user intentionally wants to break the simulation.
            // Covering this case is not worth it.
            simulator.setSettings(settings);
            actionStore.set({
                type: 'sim-settings-update',
                data: null,
            });
            close();
        }});
    }

	function startExportCircuit() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot export circuit while running the simulation.');
			return;
		}

		isExporting = true;
	}

	function createNewCircuit() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot create a circuit while running the simulation.');
			return;
		}

		let newCircuitTab = {
			name: Math.random().toString(36).slice(-5),
			circuit: defaultCircuit(),
			undoStack: [] as Command[],
			redoStack: [] as Command[]
		};
		circuitTabs = [...circuitTabs, newCircuitTab];
		currentCircuitTab = newCircuitTab;
        actionStore.set({
            type: 'circuit-new',
            data: null,
        });
        componentStore.set(null);
	}

	function switchCircuitTab(tab: CircuitTab) {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot switch circuit tabs while running the simulation.');
			return;
		}

		currentCircuitTab = tab;
        actionStore.set({
            type: 'circuit-switch',
            data: {
                name: tab.name,
            },
        });
        componentStore.set(null);
	}

	function undo() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot undo while running the simulation.');
			return;
		}

		const commandToUndo: Command = currentCircuitTab.undoStack.pop();
		if (commandToUndo != undefined) {
			commandToUndo.undo();
			actionStore.set({
				type: 'undo',
				data: null
			});
		} else {
			actionStore.set({
				type: 'undo-empty',
				data: null
			});
			return;
		}
		if (commandToUndo.redoable) {
			currentCircuitTab.redoStack.push(commandToUndo);
		}
	}

	function redo() {
		// Prevent any actions while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot redo while running the simulation.');
			return;
		}

		const commandToRedo: Command = currentCircuitTab.redoStack.pop();
		if (commandToRedo != undefined) {
			commandToRedo.do();
			actionStore.set({
				type: 'redo',
				data: null
			});
		} else {
			actionStore.set({
				type: 'redo-empty',
				data: null
			});
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
					simulator
						.setCircuit(circuit)
						.then(() => simulator.start())
						.then(() => updateCircuitTab(circuit))
						.then(() => setEditorMode(defaultRunningMode()));

					actionStore.set({
						type: 'sim-start',
						data: null
					});

					break;
				case 'paused': {
					simulator.start().then(() => {
						setEditorMode(defaultRunningMode());
					});

					actionStore.set({
						type: 'sim-resume',
						data: null
					});
					break;
				}
				default: {
					notifier.danger('Simulation already running!');
				}
			}
		});
	}

	function pauseSimulation() {
		switch ($editorModeStore.type) {
			case 'running': {
				simulator.pause().then(() => setEditorMode(defaultPausedMode()));

				actionStore.set({
					type: 'sim-pause',
					data: null
				});
				break;
			}
			case 'paused': {
				notifier.danger('Simulation already paused!');
				break;
			}
			default: {
				notifier.danger('Simulation not running!');
			}
		}
	}

	function deleteWire(e) {
		const preCommandCircuit = $circuitStore;
		const wireId = e.detail.wireId;


		const deleteWireCommand: Command = {
			name: 'DeleteWireCommand',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder.deleteWire(circuit, wireId).then((circuit) => updateCircuitTab(circuit));
			},
			undo: () => {
					updateCircuitTab(preCommandCircuit);
			},
			redoable: false
		};
		deleteWireCommand.do();
		addComandToUndoStack(deleteWireCommand);

		actionStore.set({
			type: 'wire-delete',
			data: null
		});
	}

	function deleteComponent(e) {
		const componentId = e.detail.componentId;
		const preCommandCircuit = $circuitStore;
        const previousSelectedComponent = $componentStore;
        let deletedSelectedComponent = false;

		const deleteComponentCommmand: Command = {
			name: 'DeleteComponentCommand',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder
					.deleteComponent(circuit, componentId)
					.then((circuit) => updateCircuitTab(circuit));

                // Remove the selected component
                if (componentId == $componentStore?.id) {
                    deletedSelectedComponent = true;
                    componentStore.set(null);
                }
			},
			undo: () => {
				updateCircuitTab(preCommandCircuit);
                if (deletedSelectedComponent) componentStore.set(previousSelectedComponent);
			},
			redoable: false
		};
		deleteComponentCommmand.do();
		addComandToUndoStack(deleteComponentCommmand);

		actionStore.set({
			type: 'component-delete',
			data: {
				id: componentId
			}
		});
	}

	function stopSimulation() {
		switch ($editorModeStore.type) {
			case 'paused':
			case 'running': {
				simulator
					.stop()
					.then(() => setEditorMode(defaultEditorMode()))
					.then(() => setCircuitStateStore(null));

				actionStore.set({
					type: 'sim-stop',
					data: null
				});

				break;
			}
			default: {
				notifier.danger('Simulation not running!');
			}
		}
	}

	function setCircuitStateStore(state: Map<number, any>): Promise<void> {
		circuitStateStore.set(state);
		return tick();
	}

	function stepSimulation() {
		switch ($editorModeStore.type) {
			case 'paused': {
				simulator.step();

				actionStore.set({
					type: 'sim-step',
					data: null
				});
				break;
			}
			case 'running': {
				notifier.danger('Cannot step while simulator is running!');
				break;
			}
			default: {
				deductConnections().then((circuit) => {
					updateCircuitTab(circuit)
						.then(() => simulator.setCircuit(circuit))
						.then(() => simulator.step())
						.then(() => setEditorMode(defaultPausedMode()));
				});

				actionStore.set({
					type: 'sim-start-step',
					data: null
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
			redo();
			e.preventDefault();
		}
		if (e.altKey == true && e.key.toLowerCase() == 'backspace') {
			// currentIndex should always be defined (i.e. not -1)
			// If it isn't, currentCircuitTab is not being updated somewhere
			const currentIndex = circuitTabs.findIndex((x) => x == currentCircuitTab);
			removeCircuitTab(currentIndex);
			e.preventDefault();
		}
		if (e.ctrlKey == true && e.key.toLowerCase() == 's') {
			openSaveCircuitModal();
			e.preventDefault();
		}
		if (e.ctrlKey == true && e.key.toLowerCase() == 'o') {
			openLoadCircuitModal();
			e.preventDefault();
		}
	}

	function addNewComponent(event) {
		const definition: ComponentDefinition = event.detail.componentDefinition;
		const x: number = event.detail.x;
		const y: number = event.detail.y;
		const preCommandCircuit = $circuitStore;
		const preCommandMode = clone($editorModeStore);
        let createdComponentId: number;

		const addNewComponentCommand: Command = {
			name: 'AddNewComponent',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder
					.addNewComponent(circuit, definition, x, y)
					.then(([circuit, component]) => {
                        updateCircuitTab(circuit);
                        createdComponentId = component.id;
                    });
			},
			undo: () => {
				setEditorMode(preCommandMode).then(() => updateCircuitTab(preCommandCircuit));
                if (createdComponentId == $componentStore?.id) componentStore.set(null);
			},
			redoable: false
		};
		addNewComponentCommand.do();
		addComandToUndoStack(addNewComponentCommand);

		actionStore.set({
			type: 'component-new',
			data: null
		});
	}

	function moveComponent(event): void {
		const preCommandCircuit = $circuitStore;
		const preCommandMode = clone($editorModeStore);
		const x = event.detail.x;
		const y = event.detail.y;
		const id = event.detail.componentId;
		const moveCommand: Command = {
			name: 'MoveComponent',
			do: () => {
				const circuit: Circuit = get(circuitStore);
				circuitBuilder.moveComponent(circuit, id, x, y).then((circ) => updateCircuitTab(circ));
			},
			undo: () => {
				setEditorMode(preCommandMode).then(() => {
					updateCircuitTab(preCommandCircuit);
				});
			},
			redoable: false
		};

		moveCommand.do();
		addComandToUndoStack(moveCommand);

		actionStore.set({
			type: 'component-move',
			data: { x, y }
		});
	}

	function addComandToUndoStack(command: Command) {
		if (currentCircuitTab.undoStack.length == 30) {
			currentCircuitTab.undoStack.shift();
		}
		currentCircuitTab.undoStack.push(command);
	}

	//TODO handle undo and redo
	function addNewWire(e) {
		const preCommandCircuit = $circuitStore;
		const wire: Wire = e.detail.wire;
		const junction: Junction[] = e.detail.junction;
		const preCommandMode = clone($editorModeStore);
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
					setEditorMode(mode).then(() => updateCircuitTab(circ));
				});
			},
			undo: () => {
				setEditorMode(preCommandMode).then(() => updateCircuitTab(preCommandCircuit));
			},
			redoable: false
		};
		addNewWireCommand.do();
		addComandToUndoStack(addNewWireCommand);

		actionStore.set({
			type: 'wire-new',
			data: null
		});
	}

	function processUserEvent(e) {
		const event: UserEvent = e.detail.event;
		simulator.insertUserEvent(event);
	}

	function switchEditorMode(type: EditorModeType) {
		switch (type) {
			case 'delete':
				$editorModeStore = defaultDeleteMode();
				break;
			case 'wire':
				$editorModeStore = defaultWireMode();
				break;
			case 'edit':
				$editorModeStore = defaultEditorMode();
				break;
		}
	}

	function setEditorMode(mode: EditorMode): Promise<void> {
		editorModeStore.set(mode);
		return tick();
	}

	function exportCircuit(event: CustomEvent<{ definition: ComponentDefinition }>) {
		console.log('Exported: ', event.detail.definition);
		isExporting = false;
		defLoader.insertDefinition(event.detail.definition, true);

		actionStore.set({
			type: 'circuit-export',
			data: {
				name: event.detail.definition.name
			}
		});
	}

	function cancelExport() {
		isExporting = false;

		actionStore.set({
			type: 'circuit-export-cancel',
			data: null
		});
	}

	function updateCircuitTab(circuit: Circuit): Promise<void> {
		if (currentCircuitTab != null && circuit != null) {
			currentCircuitTab.circuit = circuit;
		}
		return tick();
	}

	function removeCircuitTab(index: number): Promise<void> {
		// Do not remove circuit tabs while in simulation
		if (isInSimulation) {
			notifier.warning('Cannot remove circuit tab while running the simulation.');
			return tick();
		}

		const deleted = circuitTabs.splice(index, 1)[0];
		if (circuitTabs.length == 0) {
			createNewCircuit(); // Updates circuitTabs inside, so return early
			return tick();
		}

		// Make deleting tabs switch to a different tab when necessary intuitively
		if (deleted == currentCircuitTab) {
			if (index != 0) currentCircuitTab = circuitTabs[index - 1];
			else currentCircuitTab = circuitTabs[index];
		}
		circuitTabs = circuitTabs;

		actionStore.set({
			type: 'circuit-tab-remove',
			data: {
				name: deleted.name
			}
		});

		return tick();
	}

	$: {
		const circuit = currentCircuitTab?.circuit;
		console.log('Updating circuit');
		circuitStore.set(circuit);
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

	// Component lifetime
	onMount(() => {
		createNewCircuit();
		serviceSubscriptions.push(
			simulator.getCircuitStateBehaviourSubject().subscribe((val) => {
				setCircuitStateStore(val);
			})
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
		close();
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
			<button on:click={() => openNavigationModal()} title="Navigate rooms">
				<NavigationIcon />
			</button>
		</li>
		<li>
			<button on:click={() => openQuestsModal()} title="Quests">
				<QuestIcon />
			</button>
		</li>
		<li>
			<button on:click={() => openTutorialModal()} title="Tutorial | Not available in demo" disabled>
				<TutorialIcon />
			</button>
		</li>
	</ul>
    <ul class="settings">
        <li>
            <button on:click={() => openSettingsModal()} title="Settings">
                <SettingsIcon />
            </button>
        </li>
    </ul>
</nav>

<div id="main-content-wrapper" class="grid grid-cols-12">
	<div class="col-span-9">
		<div class="h-full flex flex-col">
			<div class="canvas-view">
				<div id="canvas-wrapper">
					<Canvas
						on:componentMove={moveComponent}
						on:addNewComponent={addNewComponent}
						on:addNewWire={addNewWire}
						on:userEventGenerated={processUserEvent}
						on:deleteWire={deleteWire}
						on:deleteComponent={deleteComponent}
					/>
				</div>
				<div class="status-bar">
					<span>Status</span>
					<span class="status scroll-shadows-x">{actionToString($actionStore)}</span>
				</div>
			</div>
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
						{#each circuitTabs as tab, i (tab)}
							<li class:selected={tab.name == currentCircuitTab.name}>
								<button on:click={() => switchCircuitTab(tab)}>
									<span>{tab.name}</span>
									<button on:click|stopPropagation={() => removeCircuitTab(i)}>
										<CloseIcon />
									</button>
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
<svelte:window on:keydown|trusted|stopPropagation={handleKeyPress} />

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
		@apply h-full relative box-border select-none;
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
		@apply pl-4 mx-4 border-l border-slate-300;
	}

	.editor-tools > li > button {
		@apply p-2 disabled:cursor-not-allowed;
	}

	.game-tools {
		@apply w-full mr-4 justify-end;
	}

	.game-tools > li > button {
		@apply p-2;
	}

    .settings {
        @apply mr-4;
    }

    .settings > li > button {
        @apply p-2;
    }

	/*
    Dropdown menu styles
    */
	.dropdown-menu {
		@apply invisible box-border absolute z-50 bg-white text-black border-blue-400 border-l-2 shadow-md select-none;
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
		@apply border-t-blue-400 !important;
	}

	.selected > button > button {
		@apply visible !important;
	}

	/*
    Editor mode styles
    */
	.editor-mode {
		@apply px-4 py-2 uppercase text-lg font-bold select-none;
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

	/*
    Bottom bar
    */
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
		@apply border-t-2 border-t-white border-r last:border-r-0 border-r-slate-200 hover:bg-slate-100 hover:border-t-slate-100;
	}

	.circuit-tabs > ul > li > button {
		@apply py-2 pl-10 pr-2 inline-flex space-x-2 select-none;
	}

	.circuit-tabs > ul > li > button:hover > button {
		@apply visible;
	}

	.circuit-tabs > ul > li > button > button {
		@apply invisible rounded-md hover:bg-slate-300 hover:opacity-50;
	}

	/*
    Aside
    */
	.aside {
		--hgt: calc(theme(height.full));
		height: var(--hgt);
		max-height: var(--hgt);
		min-height: var(--hgt);
		@apply border-l-2 border-gray-200;
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

	/*
    Canvas view
    */
	.canvas-view {
		@apply grow grid-cols-1 relative;
	}

	#canvas-wrapper {
		@apply w-full h-full col-start-1 row-start-1;
	}

	.status-bar {
		@apply absolute right-0 bottom-0 col-start-1 row-start-1 inline-flex;
	}

	.status-bar > * {
		@apply bg-white;
	}

	.status-bar > span:first-child {
		@apply py-1 pl-3 pr-2 rounded-l-full border-l border-t border-slate-300 font-bold uppercase;
	}

	.status-bar > .status {
		@apply overflow-x-auto whitespace-nowrap max-w-[24rem] py-1 px-2 border-l border-t border-slate-300 cursor-text;
	}

    *:disabled {
        @apply cursor-not-allowed;
    }
</style>
