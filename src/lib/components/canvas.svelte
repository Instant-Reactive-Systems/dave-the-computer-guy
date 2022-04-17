<script lang="ts">
	import { GenericComponentRenderable } from '$lib/fabric/generic_renderable_component';

	import type { RenderableComponent } from '$lib/fabric/renderable_component';
	import { WireRenderable } from '$lib/fabric/wire_renderable';
	import type { Circuit, WiringRenderingData } from '$lib/models/circuit';

	import { Component } from '$lib/models/component';
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { Connection } from '$lib/models/connection';
	import type { Wire } from '$lib/models/wire';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { createEventDispatcher, getContext } from 'svelte';
	import { circuitStore } from '$lib/stores/circuit';
	import { eventStore } from '$lib/stores/event_store';
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';
	import { COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { Event } from '$lib/models/event';

	let circuit = $circuitStore;
	let canvas: fabric.Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	let renderedComponents: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let wires: Map<string, fabric.Object[]> = new Map<string, fabric.Object[]>();
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
		let currentWires = wires.get(JSON.stringify(wiringRenderingData.connection));
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
			console.log(mouseEvent);
			if (!mouseEventHasTarget(mouseEvent)) {
				processNoTargetMouseDown(mouseEvent);
			}
		});

		canvas.on('object:modified', (e: any) => {
			switch (e.action) {
				case 'drag':
					processObjectDrag(e);
			}
		});
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

	function mouseEventHasTarget(event: fabric.IEvent<MouseEvent>) {
		console.log(event.target == null && event.subTargets.length == 0);
		return !(event.target == null && event.subTargets.length == 0);
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

	onMount(() => {
		prepareCanvas();
		return () => {
			canvas.dispose();
		};
	});
</script>

<svelte:window on:resize={resizeCanvas} />
<canvas bind:this={canvasElement} />

<style>
</style>
