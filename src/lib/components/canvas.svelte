<script lang="ts">
	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import { WireRenderable } from '$lib/fabric/wire_renderable';
	import _ from 'lodash';
	import { Component } from '$lib/models/component';
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
	import { Junction } from '$lib/models/circuit';
	import { createComponent } from '$lib/fabric/component_factory';
	import { circuitStateStore } from '$lib/stores/circuit_state';
	import { todo } from '$lib/util/common';
	import { editorModeStore } from '$lib/stores/editor_mode';

	let canvas: fabric.Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	let renderedComponents: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let renderedWires: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	const dispatch = createEventDispatcher();

	//handle rerendering when the circuit changes
	$: {
		if (canvas != undefined && $circuitStore != null) {
			rerenderCanvas()
		}
	}

	function rerenderCanvas() {
		clearCanvas();
		renderCircuit();
		if ($editorModeStore.type == 'wire') {
			showTemporaryJunction();
		}
	}

	$: {
		const mode = $editorModeStore;
		console.log('mode', mode);
	}

	$: {
		//disable component dragging when simulation is not stopped or when in wired mode
		if (canvas != null) {
			if (
				($editorModeStore.type == 'wire' || $simulationStateStore != 'STOPPED') &&
				canvas != null
			) {
				canvas.getObjects().forEach((obj) => {
					if (obj.data.type == 'component') {
						obj.selectable = false;
						obj.lockMovementX = true;
						obj.lockMovementY = true;
					}
				});
			} else if (!($editorModeStore.type == 'wire') && $simulationStateStore == 'STOPPED') {
				//enable dragging and selecting components if not in wired mode and not simulating
				canvas.getObjects().forEach((obj) => {
					if (obj.data.type == 'component') {
						obj.selectable = true;
						obj.lockMovementX = false;
						obj.lockMovementY = false;
					}
				});
			}
		}
	}

	//handle state rendering
	$: {
		const state = $circuitStateStore;
		console.log(state);
		if (state != null) {
			for (const stateEntry of state.entries()) {
				if (stateEntry[0] == 4294967295) {
					//renderWiringState(stateEntry);
				} else {
					const componentRef = renderedComponents.get(stateEntry[0]).data.ref;
					(componentRef as RenderableComponent).update(stateEntry[1]);
				}
			}
			canvas.renderAll();
		}
	}

	function renderWiringState(wiringState: { connector: Connector; value: boolean }[]) {
		todo();
	}

	function fetchDefinition(id: number): ComponentDefinition {
		return definitionLoaderService.getDefinition(id).unwrap();
	}

	function clearCanvas() {
		canvas.clear();
		renderedComponents = new Map<number, fabric.Object>();
		renderedWires = new Map<number, fabric.Object>();
	}

	function renderCircuit() {
		try {
			const componentsWithDefinition = $circuitStore.components.map((component) => {
				return new Component(component.id, fetchDefinition(component.definitionId));
			});
			const wires = $circuitStore.metadata.rendering.wires;
			const junctions = $circuitStore.metadata.rendering.junctions;
			renderComponents(componentsWithDefinition);
			renderWires(wires);
			renderJunctions(junctions);
		} catch (err) {
			console.error(err);
			//showErrorNotification(err);
		}
	}

	function renderJunctions(junctions: Junction[]) {
		for (const junction of junctions) {
			canvas.add(
				new fabric.Circle({
					radius: 4,
					selectable: false,
					lockMovementX: true,
					lockMovementY: true,
					hasControls: false,
					hasBorders: false,
					fill: 'black',
					top: junction.y - 4,
					left: junction.x - 4,
					data: {
						ref: junction,
						type: 'junction'
					}
				})
			);
		}
	}

	function renderComponents(components: Component[]) {
		for (const component of components) {
			//Add special case here for rendering builtins
			const renderingData = $circuitStore.metadata.rendering.components[component.id];
			if (renderingData == undefined) {
				throw new Error(
					`Component with id=${component.id} has no entry in circuit components rendering metadata`
				);
			}
			const fabricComponent = createComponent(
				renderingData.x,
				renderingData.y,
				component
			).buildFabricObject();
			canvas.add(fabricComponent);
			renderedComponents.set(component.id, fabricComponent);
		}
	}

	function renderWire(wire: Wire) {
		const wireRenderable: WireRenderable = new WireRenderable(wire);
		const fabricWire = wireRenderable.buildFabricObject();
		canvas.add(fabricWire);
		renderedWires.set(wire.id, fabricWire);
	}

	function renderWires(wires: Wire[]) {
		for (const wire of wires) {
			renderWire(wire);
		}
	}

	function resizeCanvas() {
		const parent = document.getElementById('canvas-wrapper');

		const containerWidth = parent.clientWidth;
		const containerHeight = parent.clientHeight;

		// const scale = containerWidth / canvas.getWidth();
		// const zoom  = canvas.getZoom() * scale;
		canvas.setDimensions({
			width: containerWidth,
			height: containerHeight
		});
		// canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
	}

	function prepareCanvas(): void {
		canvas = new fabric.Canvas(canvasElement);
		setupZoom(canvas);
		attachListeners(canvas);
		resizeCanvas();
	}

	function attachListeners(canvas: fabric.Canvas) {
		canvas.on('mouse:down', (mouseEvent) => {
			//handle drag
			if (mouseEvent.e.altKey === true) {
				canvas.isDragging = true;
				canvas.selection = false;
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
					}
					if (target == null) {
						processNoTargetMouseDown(mouseEvent);
						return;
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
			canvas.selection = true;
		});
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
		if ($editorModeStore.type == 'wire' && $editorModeStore.data.currentWire == null) {
			return getMouseDownTarget(mouseEvent);
		} else {
			const x = $editorModeStore.data.currentWire.data.ref.wire.endX;
			const y = $editorModeStore.data.currentWire.data.ref.wire.endY;
			const hitCircle = new fabric.Circle({ top: y - 1, left: x - 1, fill: null, radius: 1 });
			canvas.remove($editorModeStore.data.currentWire);
			for (const obj of canvas.getObjects()) {
				if (obj.intersectsWithObject(hitCircle, true)) {
					if (obj.data.type == 'component') {
						for (const innerObj of (obj as fabric.Group)._objects) {
							if (innerObj instanceof fabric.Group && innerObj.data?.type == 'pinGroup') {
								const pin = innerObj.data.pin;
								let matrix = pin.calcTransformMatrix();
								let pinX = matrix[4]; // translation in X
								let pinY = matrix[5];
								if (Math.abs(pinX - x) < pin.width && Math.abs(pinY - y) < pin.height) {
									$editorModeStore.data.currentWire.data.ref.wire.x = pinX + 2;
									$editorModeStore.data.currentWire.data.ref.wire.y = pinY + 2;
									editorModeStore.set($editorModeStore);
									return pin;
								}
							}
						}
					} else if ((obj as any).data.type == 'wire') {
						editorModeStore.set($editorModeStore);
						return obj;
					}
				}
			}
			editorModeStore.set($editorModeStore);
			return null;
		}
	}
	function processWirePressedInWireMode(wire: fabric.Object, mouseEvent) {
		if ($editorModeStore.data.currentWire == null) {
			console.log('Starting drawing wire from wire');
			const pt = canvas.getPointer(mouseEvent.evt);
			$editorModeStore.data.lastX = pt.x;
			$editorModeStore.data.lastY = pt.y;
			$editorModeStore.data.source = new DirectLink();
			$editorModeStore.data.source.type = 'wire';
			$editorModeStore.data.source.value = wire.data.ref.wire.id;
			const junction: Junction = new Junction(pt.x, pt.y, renderedWires.size);
			$editorModeStore.data.currentJunction = new fabric.Circle({
				radius: 4,
				selectable: false,
				lockMovementX: true,
				lockMovementY: true,
				hasControls: false,
				hasBorders: false,
				fill: 'black',
				top: pt.y - 4,
				left: pt.x - 4,
				data: {
					ref: junction,
					type: 'junction'
				}
			});
			editorModeStore.set($editorModeStore);
		} else {
			const link = new DirectLink();
			link.type = 'wire';
			link.value = wire.data.ref.wire.id;
			($editorModeStore.data.currentWire.data.ref.wire as Wire).links.push(link);
			dispatch('addNewWire', {
				wire: $editorModeStore.data.currentWire.data.ref.wire
			});
			dispatch('addNewJunction', {
				junction: {
					x: $editorModeStore.data.currentWire.data.ref.wire.endX,
					y: $editorModeStore.data.currentWire.data.ref.wire.endY,
					sourceWire: $editorModeStore.data.currentWire.data.ref.wire.id
				} as Junction
			});
			editorModeStore.set($editorModeStore);
			quitWireMode();
		}
	}

	function addEndWire(pin: fabric.Object) {
		if ($editorModeStore.data.currentWire == null) {
			return;
		}

		const pinType = pin.data.pinType;
		const sourceConnector: Connector = new Connector(pin.data.component.id, pin.data.value.pin);
		const link = new DirectLink();
		link.type = 'pin';
		link.value = {
			conn: sourceConnector,
			type: pinType
		};
		($editorModeStore.data.currentWire.data.ref.wire as Wire).links.push(link);
		dispatch('addNewWire', {
			wire: $editorModeStore.data.currentWire.data.ref.wire
		});
		quitWireMode();
	}

	function addNewWire(evt) {
		if ($editorModeStore.data.currentWire == null) {
			return;
		}
		$editorModeStore.data.lastX = $editorModeStore.data.currentWire.data.ref.wire.endX;
		$editorModeStore.data.lastY = $editorModeStore.data.currentWire.data.ref.wire.endY;
		$editorModeStore.data.source = new DirectLink();
		$editorModeStore.data.source.type = 'wire';
		$editorModeStore.data.source.value = renderedWires.size;
		dispatch('addNewWire', {
			wire: $editorModeStore.data.currentWire.data.ref.wire
		});
	}

	function showTemporaryWire(evt) {
		if ($editorModeStore.data.source == null) {
			return;
		}
		console.log('Showing wire');
		let x = $editorModeStore.data.lastX;
		let y = $editorModeStore.data.lastY;
		if (Math.abs(canvas.getPointer(evt.e).y - y) > Math.abs(canvas.getPointer(evt.e).x - x)) {
			y = canvas.getPointer(evt.e).y;
		} else {
			x = canvas.getPointer(evt.e).x;
		}

		if ($editorModeStore.data.currentWire != null) {
			canvas.remove($editorModeStore.data.currentWire as fabric.Object);
		}
		const wire = new Wire();
		wire.startX = $editorModeStore.data.lastX;
		wire.startY = $editorModeStore.data.lastY;
		wire.endX = x;
		wire.endY = y;
		wire.id = renderedWires.size;
		wire.links = [$editorModeStore.data.source];
		const wireRenderable: WireRenderable = new WireRenderable(wire);
		const fabricWire = wireRenderable.buildFabricObject();
		canvas.add(fabricWire);
		console.log('canvas', canvas._objects);
		$editorModeStore.data.currentWire = fabricWire;
		editorModeStore.set($editorModeStore);
	}

	function showTemporaryJunction() {
		if ($editorModeStore.data.currentJunction == null) {
			return;
		}
		if (!canvas.contains($editorModeStore.data.currentJunction)) {
			canvas.add($editorModeStore.data.currentJunction);
		}
	}

	function processPinPressedInWireMode(pin) {
		if ($editorModeStore.data.source == null) {
			const pinType = pin.data.pinType;
			const sourceConnector: Connector = new Connector(pin.data.component.id, pin.data.value.pin);
			let matrix = pin.calcTransformMatrix();
			let x = matrix[4]; // translation in X
			let y = matrix[5];
			$editorModeStore.data.lastX = x;
			$editorModeStore.data.lastY = y;
			$editorModeStore.data.source = new DirectLink();
			$editorModeStore.data.source.type = 'pin';
			$editorModeStore.data.source.value = {
				conn: sourceConnector,
				type: pinType
			};
			editorModeStore.set($editorModeStore);
		} else {
			addEndWire(pin);
		}
	}

	function initWireMode() {
		$editorModeStore.type = 'wire';
		$editorModeStore.data = {
			source: null,
			lastX: null,
			lastY: null,
			currentWire: null,
			currentJunction: null
		};
		editorModeStore.set($editorModeStore);
	}

	function getMouseDownTarget(event): fabric.Object {
		if (event.target == null && event.subTargets.length == 0) {
			return null;
		}

		if (event.subTargets.length >= 1) {
			if (event.subTargets[0].data != undefined && event.subTargets[0].data.type == 'pin') {
				console.log('Pressed pin');
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
					y: y
				})
			);

			addNewComponentToCircuit(evt.payload.componentDefinition, x, y);
		}
	}

	function addNewComponentToCircuit(
		componentDefinition: ComponentDefinition,
		x: number,
		y: number
	) {
		dispatch('addNewComponent', {
			componentDefinition: componentDefinition,
			x: x,
			y: y
		});
	}

	function setupZoom(canvas: fabric.Canvas) {
		canvas.on('mouse:wheel', (opt) => {
			var delta = opt.e.deltaY;
			var zoom = canvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.01) zoom = 0.01;
			canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			opt.e.preventDefault();
			opt.e.stopPropagation();
		});
	}

	function handleKeydown(e) {
		console.log(e);
		if ($editorModeStore.type == 'wire' && e.key == 'Escape') {
			quitWireMode();
		}
		if ($editorModeStore.type != 'wire' && e.key == 'w' && $simulationStateStore == 'STOPPED') {
			initWireMode();
		}
	}

	function quitWireMode() {
		$editorModeStore.type = 'edit';
		canvas.remove($editorModeStore.data.currentWire, $editorModeStore.data.currentJunction);
		$editorModeStore.data = null;
		editorModeStore.set($editorModeStore);
	}

	onMount(() => {
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
