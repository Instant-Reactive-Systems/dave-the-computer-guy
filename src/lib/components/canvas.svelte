<script lang="ts">
	import { GenericComponentRenderable } from '$lib/fabric/generic_renderable_component';

	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import { WireRenderable } from '$lib/fabric/wire_renderable';
	import type { Circuit, WiringRenderingData } from '$lib/models/circuit';
	import _ from 'lodash';
	import { Component } from '$lib/models/component';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import { Connection } from '$lib/models/connection';
	import { Wire } from '$lib/models/wire';
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

	let circuit: Circuit = $circuitStore;
	let canvas: fabric.Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	let renderedComponents: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let wires: Map<string, fabric.Object[]> = new Map<string, fabric.Object[]>();
	let inWireMode = false;
	let wireModeData: {
		connection: Connection;
		lastX: number;
		lastY: number;
	} = null;
	let wireModeRenderedWire = null;
	const dispatch = createEventDispatcher();

	$: {
		circuit = $circuitStore;
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
		wires = new Map<string, fabric.Object[]>();
	}

	function renderCircuit() {
		try {
			const componentsWithDefinition = circuit.components.map((component) => {
				return new Component(component.id, fetchDefinition(component.definitionId));
			});
			const wires = circuit.metadata.rendering.wires;
			renderComponents(componentsWithDefinition);
			renderWires(wires);
		} catch (err) {
			console.log(err);
			//showErrorNotification(err);
		}
	}

	function renderComponents(components: Component[]) {
		for (const component of components) {
			//Add special case here for rendering builtins
			const renderingData = circuit.metadata.rendering.components.get(component.id);
			if (renderingData == undefined) {
				throw new Error(
					`Component with id=${component.id} has no entry in circuit components rendering metadata`
				);
			}
			const fabricComponent = new GenericComponentRenderable(
				renderingData.x,
				renderingData.y,
				component
			).buildFabricObject();
			canvas.add(fabricComponent);
			renderedComponents.set(component.id, fabricComponent);
		}
	}

	function renderWire(wiringRenderingData: WiringRenderingData) {
		const wire: WireRenderable = new WireRenderable(wiringRenderingData);
		const fabricWire = wire.buildFabricObject();
		canvas.add(fabricWire);
		console.log(wiringRenderingData.connection);
		let currentWires = wires.get(JSON.stringify(wiringRenderingData.connection.from));
		if (currentWires == undefined) {
			wires.set(JSON.stringify(wiringRenderingData.connection), [fabricWire]);
		} else {
			currentWires.push(fabricWire);
		}
	}

	function renderWires(wiringRenderingDataArr: WiringRenderingData[]) {
		for (const wiringRenderingData of wiringRenderingDataArr) {
			renderWire(wiringRenderingData);
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
			if (mouseEvent.e.altKey === true) {
				canvas.isDragging = true;
				canvas.selection = false;
				canvas.lastPosX = mouseEvent.e.clientX;
				canvas.lastPosY = mouseEvent.e.clientY;
				return;
			}
			const target = getMouseDownTarget(mouseEvent);

			if (target == null && $simulationStateStore == 'STOPPED' && inWireMode) {
				addNewWire(mouseEvent);
			}
			if (target == null && $simulationStateStore == 'STOPPED') {
				processNoTargetMouseDown(mouseEvent);
				return;
			}
			if (target.data.type == 'pin') {
				processPinPressed(mouseEvent);
			}
		});

		canvas.on('object:modified', (e: any) => {
			switch (e.action) {
				case 'drag':
					processObjectDrag(e);
			}
		});

		canvas.on('mouse:move', (mouseEvent) => {
			if (canvas.isDragging) {
				canvas.viewportTransform[4] += mouseEvent.e.clientX - canvas.lastPosX;
				canvas.viewportTransform[5] += mouseEvent.e.clientY - canvas.lastPosY;
				canvas.requestRenderAll();
				canvas.lastPosX = mouseEvent.e.clientX;
				canvas.lastPosY = mouseEvent.e.clientY;
				return;
			}
			if (inWireMode) {
				showWire(mouseEvent);
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

	function addNewWire(evt) {
		console.log('Adding new wire');
		const wire: Wire = new Wire();

		wire.startX = wireModeRenderedWire.data.startX;
		wire.startY = wireModeRenderedWire.data.startY;
		wire.endX = wireModeRenderedWire.data.endX;
		wire.endY = wireModeRenderedWire.data.endY;
		dispatch('addNewWire', {
			wire: wire,
			connection: wireModeData.connection
		});
		wireModeData.lastX = wire.endX;
		wireModeData.lastY = wire.endY;
	}

	function showWire(evt) {
		console.log('Showing wire');
		let x = wireModeData.lastX;
		let y = wireModeData.lastY;
		if (Math.abs(canvas.getPointer(evt.e).y - y) > Math.abs(canvas.getPointer(evt.e).x - x)) {
			y = canvas.getPointer(evt.e).y;
		} else {
			x = canvas.getPointer(evt.e).x;
		}

		if (wireModeRenderedWire != null) {
			canvas.remove(wireModeRenderedWire);
		}
		wireModeRenderedWire = new fabric.Line([wireModeData.lastX, wireModeData.lastY, x, y], {
			stroke: 'black',
			strokeWidth: 4,
			hasControls: false,
			selectable: false
		});
		wireModeRenderedWire.data = {};
		wireModeRenderedWire.data.startX = wireModeData.lastX;
		wireModeRenderedWire.data.startY = wireModeData.lastY;
		wireModeRenderedWire.data.endX = x;
		wireModeRenderedWire.data.endY = y;
		canvas.add(wireModeRenderedWire);
	}

	function processPinPressed(mouseEvent) {
		if (!inWireMode) {
			const pin: fabric.Object = mouseEvent.subTargets[0];
			console.log(pin);
			inWireMode = true;
			wireModeData = { lastX: null, lastY: null, connection: null };
			const pinType = pin.data.pinType;
			const sourceConnector: Connector = new Connector();
			sourceConnector.componentId = pin.data.component.id;
			sourceConnector.pin = pin.data.value.pin;
			let matrix = (pin as fabric.Group).item(2).calcTransformMatrix();
			let x = matrix[4]; // translation in X
			let y = matrix[5];
			wireModeData.lastX = x;
			wireModeData.lastY = y;
			console.log(pinType);
			if (pinType == 'input') {
				const connection: Connection = new Connection();
				connection.from = null;
				connection.to = [sourceConnector];
				wireModeData.connection = connection;
			} else if (pinType == 'output') {
				let connection: Connection;
				let sameConnection = circuit.connections.find((conn) =>
					_.isEqual(conn.from, sourceConnector)
				);
				if (sameConnection == undefined) {
					connection = new Connection();
					connection.from = sourceConnector;
					connection.to = [];
				} else {
					connection = _.cloneDeep(sameConnection);
				}
				wireModeData.connection = connection;
			}
		} else {
			//handleConnectionEnd
		}
	}

	function getMouseDownTarget(event): fabric.Object {
		if (event.target == null && event.subTargets.length == 0) {
			return null;
		}

		if (event.subTargets.length == 1) {
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
			inWireMode = false;
			console.log('Setting wire mode to false');
		}
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
