<script lang="ts">
	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import _ from 'lodash';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { DirectLink, Wire } from '$lib/models/wire';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { createEventDispatcher, getContext, tick } from 'svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { eventStore } from '$lib/stores/event_store';
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';
	import { COMPONENT_DEFINITION_LOADER_SERVICE, SIMULATOR_SERVICE } from '$lib/services/service';
	import type { Event } from '$lib/models/event';
	import type { Connector } from '$lib/models/connector';
	import type { Circuit, Junction } from '$lib/models/circuit';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import { editorModeStore } from '$lib/stores/editor_mode';
	import { Canvas } from './canvas/canvas';
	import type { WireRenderable } from '$lib/fabric/wire_renderable';
	import { copy } from '$lib/util/common';
	import {
		defaultDeleteMode,
		defaultEditorMode,
		defaultWireMode,
		type EditorMode,
		type WireData
	} from '$lib/models/editor_mode';

	let canvas: Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	const dispatch = createEventDispatcher();

	// Locking/unlocking components based on state
	$: {
		if (canvas != undefined) {
			// Disable component dragging when simulation is not stopped or when in wired mode
			switch ($editorModeStore.type) {
				case 'wire':
				case 'running':
				case 'paused':
					canvas.lockComponents();
					break;
				default:
					canvas.unlockComponents();
			}
		}
	}

	$: {
		rerenderCircuit($circuitStore);
	}

	// Renders the editor mode changes and custom objects
	$: {
		if (canvas != undefined) {
			canvas.renderEditorMode($editorModeStore);
		}
	}

	// Handle state rendering
	$: {
		const state = $circuitStateStore;
		if (state != null) {
			for (const stateEntry of state.entries()) {
				// If the component is the Wiring component (u32::MAX)
				if (stateEntry[0] == 4294967295) {
					renderWiringState(stateEntry);
				} else {
					updateComponentState(stateEntry);
				}
			}

			refreshCanvas();
		} else {
			clearAllState();
		}
	}

	function refreshCanvas() {
		canvas.refresh();
	}

	function updateComponentState(stateEntry: [number, any]) {
		canvas.updateComponent(stateEntry[0], stateEntry[1]);
	}

	function renderWiringState(stateEntry: [number, any]) {
		canvas.renderWiringState(stateEntry[1], $circuitStore.metadata.rendering.wiringRendering);
	}

	function prepareCanvas(): void {
		const parent = document.getElementById('canvas-wrapper');
		const width = parent.clientWidth;
		const height = parent.clientHeight;

		const fabricCanvas = new fabric.Canvas(canvasElement, {
			selection: false
		});
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
		canvas.on('mouse:down', (event: fabric.IEvent<MouseEvent>) => {
			// Drag has precedence over all other mouse down events
			if (handleDrag(event)) return;
			// Handle mouse down event depending on editor mode
			handleMousedown(event);
		});

		canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
			canvas.setViewportTransform(canvas.viewportTransform);
			canvas.isDragging = false;
			switch ($editorModeStore.type) {
				case 'delete':
					const mode = _.cloneDeep($editorModeStore);
					mode.data = 'released';
					editorModeStore.set(mode);
					break;
				default:
					break;
			}
		});

		canvas.on('object:modified', (e: any) => {
			switch (e.action) {
				case 'drag':
					processObjectDrag(e);
			}
		});

		canvas.on('mouse:move', (event: fabric.IEvent<MouseEvent>) => {
			if (canvas.isDragging) {
				canvas.viewportTransform[4] += event.e.clientX - canvas.lastPosX;
				canvas.viewportTransform[5] += event.e.clientY - canvas.lastPosY;
				canvas.requestRenderAll();
				canvas.lastPosX = event.e.clientX;
				canvas.lastPosY = event.e.clientY;
				return;
			}

			if ($editorModeStore.type == 'wire') {
				showTemporaryWire(event);
			} else if ($editorModeStore.type == 'delete') {
				if ($editorModeStore.data == 'pressed') {
					deleteObject(event);
				}
			}
		});
	}

	function handleDrag(event: fabric.IEvent<MouseEvent>): boolean {
		if (event.e.altKey == true) {
			canvas.isDragging = true;
			canvas.lastPosX = event.e.clientX;
			canvas.lastPosY = event.e.clientY;
			return true;
		}

		return false;
	}

	function deleteObject(mouseEvent) {
		const pt = canvas.getPointer(mouseEvent.evt);
		const x = pt.x;
		const y = pt.y;
		const hitCircle = new fabric.Circle({ top: y - 1, left: x - 1, fill: null, radius: 1 });

		for (const obj of canvas.getObjects()) {
			if (obj.intersectsWithObject(hitCircle, true)) {
				switch (obj.data.type) {
					case 'component': {
						const componentId = (obj.data.ref as RenderableComponent).component.id;
						deleteComponent(componentId);
						break;
					}
					case 'wire': {
						if (!obj.data.isTemp) {
							const wireId = (obj.data.ref as WireRenderable).wire.id;
							deleteWire(wireId);
						}
					}
					default: {
					}
				}
			}
		}
	}

	function deleteWire(wireId) {
		dispatch('deleteWire', {
			wireId: wireId
		});
	}

	function rerenderCircuit(circuit: Circuit) {
		if (circuit == null) return;

		const definitionIds = circuit.components.map((c) => c.definitionId);
		const definitions = getDefinitions(definitionIds);
		renderCircuit(circuit, definitions);
	}

	function clearAllState() {
		//We clear the state by rerendering the circuit freshly
		const circuit = $circuitStore;
		rerenderCircuit(circuit);
	}

	function handleMousedown(event: fabric.IEvent<MouseEvent>) {
		switch ($editorModeStore.type) {
			case 'paused':
			case 'running': {
				const target = getMouseDownTarget(event);

				if (target != null && target.data.type == 'component') {
					generateUserEvent(target.data.ref as RenderableComponent);
				}

				break;
			}
			case 'wire': {
				handleMousedownInWiredMode(event);
				break;
			}
			case 'edit': {
				handleMouseDownInEditMode(event);
				break;
			}
			case 'delete': {
				const mode = _.cloneDeep($editorModeStore);
				mode.data = 'pressed';
				editorModeStore.set(mode);
				break;
			}
		}
	}

	function handleMousedownInWiredMode(mouseEvent) {
		const target = getWiredModeTarget(mouseEvent);
		if (target == null) {
			addNewWire(mouseEvent);
		} else if (target.data.type == 'wire') {
			processWirePressedInWireMode(target, mouseEvent);
		} else if (target.data.type == 'pin') {
			processPinPressedInWireMode(target);
		}
	}

	function generateUserEvent(component: RenderableComponent) {
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

		if ((mode.data as WireData).currentWire == null) {
			return getMouseDownTarget(mouseEvent);
		}

		const x = (mode.data as WireData).currentWire.endX;
		const y = (mode.data as WireData).currentWire.endY;
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
		const mode = copy($editorModeStore);
		if (mode.data.source == null) {
			const pt = canvas.getPointer(mouseEvent.evt);
			mode.data.lastX = pt.x;
			mode.data.lastY = pt.y;
			const link: DirectLink = {
				type: 'wire',
				value: wire.data.ref.wire.id
			};
			mode.data.source = link;
			const junction: Junction = {
				x: pt.x,
				y: pt.y,
				sourceWire: canvas.wires.size
			};
			mode.data.currentJunction = junction;
			editorModeStore.set(mode);
		} else {
			const link: DirectLink = {
				type: 'wire',
				value: wire.data.ref.wire.id
			};

			const currentWire = mode.data.currentWire as Wire;
			currentWire.links.push(link);

			const junction: Junction = {
				x: currentWire.endX,
				y: currentWire.endY,
				sourceWire: currentWire.id
			};

			quitWireMode().then(() => {
				dispatch('addNewWire', {
					wire: currentWire,
					junction: [junction, mode.data.currentJunction]
				});
			});
		}
	}

	function addEndWire(pin: fabric.Object) {
		const mode: EditorMode = copy($editorModeStore);
		if ((mode.data as WireData).currentWire == null) return;

		const pinType = pin.data.pinType;
		const sourceConnector: Connector = {
			componentId: pin.data.component.id,
			pin: pin.data.value.pin
		};
		const link: DirectLink = {
			type: 'pin',
			value: {
				conn: sourceConnector,
				type: pinType
			}
		};

		const currentWire = (mode.data as WireData).currentWire as Wire;
		currentWire.links.push(link);
		dispatch('addNewWire', {
			wire: currentWire,
			junction: [(mode.data as WireData).currentJunction]
		});

		quitWireMode();
	}

	function addNewWire(_event: Event) {
		const mode = copy($editorModeStore);
		if ((mode.data as WireData).currentWire == null) return;

		const currentWire = mode.data.currentWire as Wire;
		(mode.data as WireData).lastX = currentWire.endX;
		(mode.data as WireData).lastY = currentWire.endY;
		(mode.data as WireData).source = {
			type: 'wire',
			value: canvas.wires.size
		};
		dispatch('addNewWire', {
			wire: currentWire,
			junction: [mode.data.currentJunction]
		});

		mode.data.currentJunction = null;
		editorModeStore.set(mode);
	}

	function showTemporaryWire(evt) {
		const mode: EditorMode = copy($editorModeStore);

		if ((mode.data as WireData).source == null) return;

		let x = (mode.data as WireData).lastX;
		let y = (mode.data as WireData).lastY;
		if (Math.abs(canvas.getPointer(evt.e).y - y) > Math.abs(canvas.getPointer(evt.e).x - x)) {
			y = canvas.getPointer(evt.e).y;
		} else {
			x = canvas.getPointer(evt.e).x;
		}

		const wire: Wire = {
			id: canvas.wires.size,
			startX: (mode.data as WireData).lastX,
			startY: (mode.data as WireData).lastY,
			endX: x,
			endY: y,
			links: [(mode.data as WireData).source]
		};

		(mode.data as WireData).currentWire = wire;

		editorModeStore.set(mode);
	}

	function processPinPressedInWireMode(pin: fabric.Object) {
		const mode: EditorMode = copy($editorModeStore);

		if ((mode.data as WireData).source == null) {
			const pinType = pin.data.pinType;
			const sourceConnector: Connector = {
				componentId: pin.data.component.id,
				pin: pin.data.value.pin
			};
			const matrix = pin.calcTransformMatrix();
			const x = matrix[4]; // translation in X
			const y = matrix[5];
			(mode.data as WireData).lastX = x;
			(mode.data as WireData).lastY = y;
			(mode.data as WireData).source = {
				type: 'pin',
				value: {
					conn: sourceConnector,
					type: pinType
				}
			};

			editorModeStore.set(mode);
		} else {
			addEndWire(pin);
		}
	}

	function initWireMode() {
		const mode = defaultWireMode();
		editorModeStore.set(mode);
	}

	function getMouseDownTarget(event): fabric.Object {
		if (event.target == null && event.subTargets.length == 0) {
			return null;
		}

		if (event.subTargets.length >= 1) {
			if (event.subTargets[0].data != undefined && event.subTargets[0].data.type == 'pin') {
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
			const newEvent: Event = {
				source: 'Canvas',
				type: 'click',
				payload: {
					x: x,
					y: y,
					target: null
				}
			};
			eventStore.set(newEvent);

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

	function initDeleteMode() {
		const mode = defaultDeleteMode();
		mode.data = 'released';
		editorModeStore.set(mode);
	}

	function deleteComponent(componentId: number) {
		dispatch('deleteComponent', {
			componentId: componentId
		});
	}

	function quitDeleteMode() {
		const mode = defaultEditorMode();
		editorModeStore.set(mode);
	}

	function handleKeydown(event: KeyboardEvent) {
		switch ($editorModeStore.type) {
			case 'edit': {
				// Reset component selection
				if (event.key == 'Escape') editorModeStore.set(defaultEditorMode());

				// Switch to wire mode
				if (event.key == 'w') initWireMode();

				if (event.key == 'd') initDeleteMode();
				break;
			}
			case 'wire': {
				// Switch to edit mode
				if (event.key == 'Escape') quitWireMode();
				break;
			}
			case 'delete': {
				if (event.key == 'Escape') quitDeleteMode();
				break;
			}
			case 'running': {
				break;
			}
			case 'paused': {
				break;
			}
		}
	}

	function quitWireMode(): Promise<void>{
		const mode = defaultEditorMode();
		return setEditorMode(mode);
	}

	function setEditorMode(mode: EditorMode): Promise<void> {
		editorModeStore.set(mode);
		return tick();
	}

	function resizeCanvas(_event) {
		const parent = document.getElementById('canvas-wrapper');
		if (parent == null) {
			return;
		}

		const width = parent.clientWidth;
		const height = parent.clientHeight;

		const size = { width, height };
		canvas.resize(size);
	}

	onMount(() => {
		console.log('Mounted canvas');
		prepareCanvas();

		return () => {
			console.log('Disposing canvas');
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
