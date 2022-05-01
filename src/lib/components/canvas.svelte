<script lang="ts">
	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import _ from 'lodash';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import { DirectLink, Wire } from '$lib/models/wire';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { createEventDispatcher, getContext } from 'svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { eventStore } from '$lib/stores/event_store';
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';
	import { COMPONENT_DEFINITION_LOADER_SERVICE, SIMULATOR_SERVICE } from '$lib/services/service';
	import { Event } from '$lib/models/event';
	import { simulationStateStore } from '$lib/stores/simulation_state';
	import { Connector } from '$lib/models/connector';
	import { Circuit, Junction } from '$lib/models/circuit';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import { editorModeStore } from '$lib/stores/editor_mode';
	import { Canvas } from './canvas/canvas';

	let canvas: Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	const dispatch = createEventDispatcher();

	$: {
		if ($circuitStore != null) {
			console.log('Called', $circuitStore);
			const circuit = $circuitStore;
			const definitionIds = circuit.components.map((c) => c.definitionId);
			const definitions = getDefinitions(definitionIds);
			renderCircuit(circuit, definitions);
		}
	}

	// Renders the editor mode changes and custom objects
	$: {
		if (canvas != undefined) {
			canvas.renderEditorMode($editorModeStore);
		}
	}

	// Locking/unlocking components based on state
	$: {
		if (canvas != undefined) {
			if ($editorModeStore.type == 'wire' || $simulationStateStore != 'STOPPED') {
				// Disable component dragging when simulation is not stopped or when in wired mode
				canvas.lockComponents();
			} else if ($simulationStateStore == 'STOPPED') {
				// Enable dragging and selecting components if not in wired mode and not simulating
				canvas.unlockComponents();
			}
		}
	}

	// Handle state rendering
	$: {
		const state = $circuitStateStore;
		if (state != null) {
			for (const stateEntry of state.entries()) {
				// If the component is the Wiring component (u32::MAX)
				if (stateEntry[0] == 4294967295) {
					canvas.renderWiringState(stateEntry[1],$circuitStore.metadata.rendering.wiringRendering);
				} else {
					canvas.updateComponent(stateEntry[0], stateEntry[1]);
				}
			}

			canvas.refresh();
		}
	}

	$: {
		console.log('mode is', $editorModeStore);
	}

	function prepareCanvas(): void {
		const parent = document.getElementById('canvas-wrapper');
		const width = parent.clientWidth;
		const height = parent.clientHeight;

		const fabricCanvas = new fabric.Canvas(canvasElement);
		const size = { width, height };
		canvas = new Canvas(fabricCanvas, size);
		attachListeners();
	}

	function getDefinitions(definitionIds: number[]) {
		return definitionLoaderService.getDefinitions(definitionIds);
	}

	function renderCircuit(circuit: Circuit, definitions: Map<number, ComponentDefinition>) {
		canvas.render(circuit, definitions);
	}

	function attachListeners() {
		canvas.on('mouse:down', (mouseEvent) => {
			console.log('mouse down');
			//handle drag
			if (mouseEvent.e.altKey === true) {
				canvas.isDragging = true;
				canvas.lastPosX = mouseEvent.e.clientX;
				canvas.lastPosY = mouseEvent.e.clientY;
				return;
			}

			//handle mouse down event depending on simulation state
			switch ($simulationStateStore) {
				case 'RUNNING': {
					const target = getMouseDownTarget(mouseEvent);

					if (target != null && target.data.type == 'component') {
						generateUserEvent(target.data.ref as RenderableComponent);
					} else if (target == null) {
						processNoTargetMouseDown(mouseEvent);
					}

					break;
				}
				case 'STOPPED': {
					if ($editorModeStore.type == 'wire') {
						handleMousedownInWiredMode(mouseEvent);
					} else {
						handleMouseDownInEditMode(mouseEvent);
					}

					break;
				}
				case 'PAUSED': {
					const target = getMouseDownTarget(mouseEvent);
					if (target != null && target.data.type == 'component') {
						generateUserEvent(target.data.ref as RenderableComponent);
					}
					if (target == null) {
						processNoTargetMouseDown(mouseEvent);
						return;
					}

					break;
				}
			}
		});

		canvas.on('object:modified', (e: any) => {
			switch (e.action) {
				case 'drag':
					processObjectDrag(e);
			}
		});

		canvas.on('mouse:move', (mouseEvent) => {
			const pt = canvas.getPointer(mouseEvent.e);
			if (canvas.isDragging) {
				canvas.viewportTransform[4] += mouseEvent.e.clientX - canvas.lastPosX;
				canvas.viewportTransform[5] += mouseEvent.e.clientY - canvas.lastPosY;
				canvas.requestRenderAll();
				canvas.lastPosX = mouseEvent.e.clientX;
				canvas.lastPosY = mouseEvent.e.clientY;
				return;
			}
			if ($editorModeStore.type == 'wire') {
				showTemporaryWire(mouseEvent);
			}
		});

		canvas.on('mouse:up', (_) => {
			// on mouse up we want to recalculate new interaction
			// for all objects, so we call setViewportTransform
			canvas.setViewportTransform(canvas.viewportTransform);
			canvas.isDragging = false;
		});
	}

	function handleMousedownInWiredMode(mouseEvent) {
		const target = getWiredModeTarget(mouseEvent);
		if (target == null) {
			console.log('Adding new wire');
			addNewWire(mouseEvent);
		} else if (target.data.type == 'wire') {
			processWirePressedInWireMode(target, mouseEvent);
		} else if (target.data.type == 'pin') {
			processPinPressedInWireMode(target);
		}
	}

	function generateUserEvent(component: RenderableComponent) {
		console.log('Generating user event');
		const event = component.onClick();
		if (event != null) {
			dispatch('userEventGenerated', {
				event: event
			});
		}
	}

	function handleMouseDownInEditMode(mouseEvent) {
		const target = getMouseDownTarget(mouseEvent);
		if (target == null) {
			processNoTargetMouseDown(mouseEvent);
		}
	}

	function getWiredModeTarget(mouseEvent) {
		const mode = _.cloneDeep($editorModeStore);

		if (mode.data.currentWire == null) {
			console.log('Current wire is null');
			return getMouseDownTarget(mouseEvent);
		}

		const x = mode.data.currentWire.endX;
		const y = mode.data.currentWire.endY;
		const hitCircle = new fabric.Circle({ top: y - 1, left: x - 1, fill: null, radius: 1 });

		for (const obj of canvas.getObjects()) {
			if (obj.intersectsWithObject(hitCircle, true)) {
				switch (obj.data.type) {
					case 'component': {
						const component = obj.data.ref;
						for (const pin of component.pins) {
							let matrix = pin.calcTransformMatrix();
							let pinX = matrix[4]; // translation in X
							let pinY = matrix[5];
							if (Math.abs(pinX - x) < pin.width && Math.abs(pinY - y) < pin.height) {
								mode.data.currentWire.x = pinX + 2;
								mode.data.currentWire.y = pinY + 2;
								editorModeStore.set(mode);
								return pin;
							}
						}
						break;
					}
					case 'wire': {
						if (!obj.data.isTemp) {
							return obj;
						}
					}
					default: {
					}
				}
			}
		}

		return null;
	}

	function processWirePressedInWireMode(wire: fabric.Object, mouseEvent) {
		const mode = _.cloneDeep($editorModeStore);
		if (mode.data.source == null) {
			const pt = canvas.getPointer(mouseEvent.evt);
			mode.data.lastX = pt.x;
			mode.data.lastY = pt.y;
			mode.data.source = new DirectLink();
			mode.data.source.type = 'wire';
			mode.data.source.value = wire.data.ref.wire.id;

			const junction = new Junction(pt.x, pt.y, canvas.wires.size);
			mode.data.currentJunction = junction;
			editorModeStore.set(mode);
		} else {
			const link = new DirectLink();
			link.type = 'wire';
			link.value = wire.data.ref.wire.id;

			const currentWire = mode.data.currentWire as Wire;
			currentWire.links.push(link);

			const junction = new Junction(currentWire.endX, currentWire.endY, currentWire.id);
			dispatch('addNewWire', {
				wire: currentWire,
				junction: [junction, mode.data.currentJunction]
			});

			quitWireMode();
		}
	}

	function addEndWire(pin: fabric.Object) {
		const mode = _.cloneDeep($editorModeStore);
		if (mode.data.currentWire == null) return;

		const pinType = pin.data.pinType;
		const sourceConnector: Connector = new Connector(pin.data.component.id, pin.data.value.pin);
		const link = new DirectLink();
		link.type = 'pin';
		link.value = {
			conn: sourceConnector,
			type: pinType
		};

		const currentWire = mode.data.currentWire as Wire;
		currentWire.links.push(link);
		dispatch('addNewWire', {
			wire: currentWire,
			junction: [mode.data.currentJunction]
		});

		quitWireMode();
	}

	function addNewWire(_event: Event) {
		const mode = _.cloneDeep($editorModeStore);
		if (mode.data.currentWire == null) return;

		const currentWire = mode.data.currentWire as Wire;
		mode.data.lastX = currentWire.endX;
		mode.data.lastY = currentWire.endY;
		mode.data.source = new DirectLink();
		mode.data.source.type = 'wire';
		mode.data.source.value = canvas.wires.size;
		dispatch('addNewWire', {
			wire: currentWire,
			junction: [mode.data.currentJunction]
		});

		mode.data.currentJunction = null;
		editorModeStore.set(mode);
	}

	function showTemporaryWire(evt) {
		const mode = _.cloneDeep($editorModeStore);

		if (mode.data.source == null) return;

		let x = mode.data.lastX;
		let y = mode.data.lastY;
		if (Math.abs(canvas.getPointer(evt.e).y - y) > Math.abs(canvas.getPointer(evt.e).x - x)) {
			y = canvas.getPointer(evt.e).y;
		} else {
			x = canvas.getPointer(evt.e).x;
		}

		const wire = new Wire();
		wire.startX = mode.data.lastX;
		wire.startY = mode.data.lastY;
		wire.endX = x;
		wire.endY = y;
		wire.id = canvas.wires.size;
		wire.links = [mode.data.source];
		mode.data.currentWire = wire;

		editorModeStore.set(mode);
	}

	function processPinPressedInWireMode(pin: fabric.Object) {
		const mode = _.cloneDeep($editorModeStore);

		if (mode.data.source == null) {
			const pinType = pin.data.pinType;
			const sourceConnector: Connector = new Connector(pin.data.component.id, pin.data.value.pin);
			const matrix = pin.calcTransformMatrix();
			const x = matrix[4]; // translation in X
			const y = matrix[5];
			mode.data.lastX = x;
			mode.data.lastY = y;
			mode.data.source = new DirectLink();
			mode.data.source.type = 'pin';
			mode.data.source.value = {
				conn: sourceConnector,
				type: pinType
			};

			editorModeStore.set(mode);
		} else {
			addEndWire(pin);
		}
	}

	function initWireMode() {
		const mode = _.cloneDeep($editorModeStore);

		mode.type = 'wire';
		mode.data = {
			source: null,
			lastX: null,
			lastY: null,
			currentWire: null,
			currentJunction: null
		};
		editorModeStore.set(mode);
	}

	function getMouseDownTarget(event): fabric.Object {
		if (event.target == null && event.subTargets.length == 0) {
			return null;
		}

		if (event.subTargets.length >= 1) {
			if (event.subTargets[0].data != undefined && event.subTargets[0].data.type == 'pin') {
				console.log('Pressed pin', event, $editorModeStore);
				return event.subTargets[0];
			}
		}

		if (event.target != null) {
			return event.target;
		}
	}
	function processObjectDrag(e) {
		if (e.target.data.type != 'component') {
			return;
		}
		const y = e.target.top;
		const x = e.target.left;
		const componentId = e.target.data.ref.component.id;
		onComponentMove(componentId, x, y);
	}

	function onComponentMove(componentId: number, x: number, y: number) {
		dispatch('componentMove', {
			componentId,
			x,
			y
		});
	}

	function processNoTargetMouseDown(event) {
		if ($eventStore != null && $eventStore.source == 'ComponentDefinitionComponent') {
			const x = canvas.getPointer(event.opt).x;
			const y = canvas.getPointer(event.opt).y;
			const evt = $eventStore;
			eventStore.set(
				new Event('Canvas', 'click', {
					x: x,
					y: y,
					target: null
				})
			);

			addNewComponentToCircuit(evt.payload.componentDefinition, x, y);
		}
	}

	function addNewComponentToCircuit(def: ComponentDefinition, x: number, y: number) {
		dispatch('addNewComponent', {
			componentDefinition: def,
			x: x,
			y: y
		});
	}

	function handleKeydown(e) {
		if ($editorModeStore.type == 'wire' && e.key == 'Escape') {
			quitWireMode();
			return;
		}

		if ($editorModeStore.type != 'wire' && e.key == 'w' && $simulationStateStore == 'STOPPED') {
			initWireMode();
			return;
		}
	}

	function quitWireMode() {
		const mode = _.cloneDeep($editorModeStore);
		mode.type = 'edit';
		mode.data = null;
		console.log('Quitting wire mode');
		editorModeStore.set(mode);
	}

	function resizeCanvas(_event) {
		const parent = document.getElementById('canvas-wrapper');
		const width = parent.clientWidth;
		const height = parent.clientHeight;

		const size = { width, height };
		canvas.resize(size);
	}

	onMount(() => {
		console.log('Mounted canvas');
		prepareCanvas();

		return () => {
			canvas.dispose();
		};
	});
</script>

<svelte:window
	on:resize={resizeCanvas}
	on:keydown|preventDefault|trusted|stopPropagation={handleKeydown}
/>
<canvas bind:this={canvasElement} />

<style>
</style>
