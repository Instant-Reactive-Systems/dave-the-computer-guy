<script lang="ts">
	import { GenericComponentRenderable } from '$lib/fabric/generic_renderable_component';

	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import { WireRenderable } from '$lib/fabric/wire_renderable';
	import _ from 'lodash';
	import { Component } from '$lib/models/component';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import { Connection } from '$lib/models/connection';
	import { DirectLink, Wire } from '$lib/models/wire';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { createEventDispatcher, getContext } from 'svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { eventStore } from '$lib/stores/event_store';
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { Event } from '$lib/models/event';
	import { simulationStateStore } from '$lib/stores/simulation_state';
	import { ConnectableObservable } from 'rxjs';
	import { JsonObjectMetadata } from 'typedjson';
	import { Connector } from '$lib/models/connector';
	import type { Input } from 'postcss';
	import type { Circuit } from '$lib/models/circuit';
	import { NandRenderable } from '$lib/fabric/nand_renderable';
	import { SwitchRenderable } from '$lib/fabric/switch_renderable';
	import { LedRenderable } from '$lib/fabric/led_renderable';
	import type { Junction } from '$lib/models/circuit';
	import { createComponent } from '$lib/fabric/component_factory';
	import { xlink_attr } from 'svelte/internal';

	let circuit: Circuit = $circuitStore;
	let canvas: fabric.Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	let renderedComponents: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let renderedWires: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let inWireMode = false;
	let wireModeData: {
		source: DirectLink;
		lastX: number;
		lastY: number;
		currentWire: fabric.Object;
	} = null;
	const dispatch = createEventDispatcher();

	$: {
		circuit = $circuitStore;
		if (circuit != null) {
			console.log(JSON.stringify(circuit.metadata.rendering));
		}
		if (canvas != undefined && circuit != null) {
			clearCanvas();
			renderCircuit();
		}
	}

	$: {
		let event = $eventStore;
		if (
			event != undefined &&
			event.type == 'click' &&
			event.source == 'ComponentDefinitionComponent'
		) {
		}
	}

	$: {
		if (inWireMode && canvas != null) {
			console.log('In Wire mode');
			canvas.getObjects().forEach((obj) => {
				obj.selectable = false;
				obj.lockMovementX = true;
				obj.lockMovementY = true;
			});
		} else if (canvas != null && !inWireMode) {
			canvas.getObjects().forEach((obj) => {
				obj.selectable = true;
				obj.lockMovementX = false;
				obj.lockMovementY = false;
			});
		}
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
			const componentsWithDefinition = circuit.components.map((component) => {
				return new Component(component.id, fetchDefinition(component.definitionId));
			});
			const wires = circuit.metadata.rendering.wires;
			const junctions = circuit.metadata.rendering.junctions;
			renderComponents(componentsWithDefinition);
			renderWires(wires);
			renderJunctions(junctions);
		} catch (err) {
			console.log(err);
			//showErrorNotification(err);
		}
	}

	function renderJunctions(junctions: Junction[]) {
		for (const junction of junctions) {
			canvas.add(
				new fabric.Circle({
					radius: 4,
					selectable: false,
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
			const renderingData = circuit.metadata.rendering.components[component.id];
			if (renderingData == undefined) {
				throw new Error(
					`Component with id=${component.id} has no entry in circuit components rendering metadata`
				);
			}
			const fabricComponent = createComponent(renderingData.x, renderingData.y, component).buildFabricObject();
			canvas.add(fabricComponent);
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
			console.log(mouseEvent);
			if (mouseEvent.e.altKey === true) {
				canvas.isDragging = true;
				canvas.selection = false;
				canvas.lastPosX = mouseEvent.e.clientX;
				canvas.lastPosY = mouseEvent.e.clientY;
				return;
			}

			if ($simulationStateStore == 'STOPPED' && inWireMode) {
				const target = getWiredModeTarget(mouseEvent);
				if (target == null) {
					addNewWire(mouseEvent);
				} else if (target.data.type == 'wire') {
					addNewWireToWireConnection(target);
				} else if (target.data.type == 'pin') {
					processPinPressedInWireMode(target);
				}
			}

			const target = getMouseDownTarget(mouseEvent);

			if (target == null && $simulationStateStore == 'STOPPED') {
				processNoTargetMouseDown(mouseEvent);
				return;
			}
			if (target.data.type == 'pin' && !inWireMode) {
				processPinPressed(target);
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
			if (inWireMode) {
				showWires(mouseEvent);
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

	function processPinPressed(evt) {
		console.log(evt);
	}

	function getWiredModeTarget(mouseEvent) {
		if (wireModeData.currentWire == null) {
			console.log('Current wire is null');
			return getMouseDownTarget(mouseEvent);
		} else {
			const x = wireModeData.currentWire.data.ref.wire.endX;
			const y = wireModeData.currentWire.data.ref.wire.endY;
			const id = wireModeData.currentWire.data.ref.wire.id;
			const hitCircle = new fabric.Circle({ top: y - 1, left: x - 1, fill: null, radius: 1 });
			canvas.remove(wireModeData.currentWire);
			for (const obj of canvas.getObjects()) {
				if (obj.intersectsWithObject(hitCircle, true)) {
					console.log('Intersection data', x, y, obj);
					if (obj.data.type == 'component') {
						console.log(obj);
						for (const innerObj of (obj as fabric.Group)._objects) {
							console.log(innerObj);
							if (innerObj instanceof fabric.Group && innerObj.data?.type == "pinGroup") {
								const pin = innerObj.data.pin;
								let matrix = pin.calcTransformMatrix();
								let pinX = matrix[4]; // translation in X
								let pinY = matrix[5];
								if (Math.abs(pinX - x) < pin.width && Math.abs(pinY - y) < pin.height) {
									wireModeData.currentWire.data.ref.wire.x = pinX + 2;
									wireModeData.currentWire.data.ref.wire.y = pinY + 2;
									return pin;
								}
							}
						}
					} else if ((obj as any).data.type == 'wire') {
						return obj;
					}
				}
			}
			return null;
		}
	}
	function addNewWireToWireConnection(wire: fabric.Object) {
		console.log('Adding wire to wire connection');
		if (wireModeData.currentWire == null) {
			return;
		}
		const link = new DirectLink();
		link.type = 'wire';
		link.value = wire.data.ref.wire.id;
		(wireModeData.currentWire.data.ref.wire as Wire).links.push(link);
		dispatch('addNewWire', {
			wire: wireModeData.currentWire.data.ref.wire
		});
		dispatch('addNewJunction', {
			junction: {
				x: wireModeData.currentWire.data.ref.wire.endX,
				y: wireModeData.currentWire.data.ref.wire.endY,
				sourceWire: wireModeData.currentWire.data.ref.wire.id
			} as Junction
		});
		quitWireMode();
	}

	function addEndWire(pin: fabric.Object) {
		if (wireModeData.currentWire == null) {
			return;
		}

		const pinType = pin.data.pinType;
		const sourceConnector: Connector = new Connector();
		sourceConnector.componentId = pin.data.component.id;
		sourceConnector.pin = pin.data.value.pin;
		const link = new DirectLink();
		link.type = 'pin';
		link.value = {
			conn: sourceConnector,
			type: pinType
		};
		(wireModeData.currentWire.data.ref.wire as Wire).links.push(link);
		dispatch('addNewWire', {
			wire: wireModeData.currentWire.data.ref.wire
		});
		quitWireMode();
	}

	function addNewWire(evt) {
		if (wireModeData.currentWire == null) {
			return;
		}
		wireModeData.lastX = wireModeData.currentWire.data.ref.wire.endX;
		wireModeData.lastY = wireModeData.currentWire.data.ref.wire.endY;
		wireModeData.source = new DirectLink();
		wireModeData.source.type = 'wire';
		wireModeData.source.value = renderedWires.size;
		dispatch('addNewWire', {
			wire: wireModeData.currentWire.data.ref.wire
		});
	}

	function showWires(evt) {
		if (wireModeData.source == null) {
			return;
		}
		console.log('Showing wire');
		let x = wireModeData.lastX;
		let y = wireModeData.lastY;
		if (Math.abs(canvas.getPointer(evt.e).y - y) > Math.abs(canvas.getPointer(evt.e).x - x)) {
			y = canvas.getPointer(evt.e).y;
		} else {
			x = canvas.getPointer(evt.e).x;
		}

		if (wireModeData.currentWire != null) {
			canvas.remove(wireModeData.currentWire as fabric.Object);
		}
		const wire = new Wire();
		wire.startX = wireModeData.lastX;
		wire.startY = wireModeData.lastY;
		wire.endX = x;
		wire.endY = y;
		wire.id = renderedWires.size;
		wire.links = [wireModeData.source];
		const wireRenderable: WireRenderable = new WireRenderable(wire);
		wireModeData.currentWire = wireRenderable.buildFabricObject();
		canvas.add(wireModeData.currentWire);
	}

	function processPinPressedInWireMode(pin) {
		if (wireModeData.source == null) {
			const pinType = pin.data.pinType;
			const sourceConnector: Connector = new Connector();
			sourceConnector.componentId = pin.data.component.id;
			sourceConnector.pin = pin.data.value.pin;
			let matrix = pin.calcTransformMatrix();
			let x = matrix[4]; // translation in X
			let y = matrix[5];
			wireModeData.lastX = x;
			wireModeData.lastY = y;
			console.log(pinType);
			wireModeData.source = new DirectLink();
			wireModeData.source.type = 'pin';
			wireModeData.source.value = {
				conn: sourceConnector,
				type: pinType
			};
			console.log(wireModeData);
		} else {
			addEndWire(pin);
		}
	}

	function initWireMode() {
		inWireMode = true;
		wireModeData = {
			source: null,
			lastX: null,
			lastY: null,
			currentWire: null
		};
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
		console.log('Adding new component');
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
		if (inWireMode && e.key == 'Escape') {
			quitWireMode();
		}
		if (!inWireMode && e.key == 'w') {
			initWireMode();
		}
	}

	function quitWireMode() {
		inWireMode = false;
		canvas.remove(wireModeData.currentWire);
		wireModeData = null;
		console.log('Setting wire mode to false');
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
