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

	import { circuitStore } from '$lib/stores/circuit';
	import { fabric } from 'fabric';
	import { stringify } from 'postcss';
	import { onMount } from 'svelte';

	let circuit = $circuitStore;
	let canvas: fabric.Canvas;
	let canvasElement;
	let definitionLoaderService: ComponentDefinitionLoaderService;
	let renderedComponents: Map<number, fabric.Object> = new Map<number, fabric.Object>();
	let wires: Map<string, fabric.Object[]> = new Map<string, fabric.Object[]>();

	$: {
		console.log('Rerendering circuit');
		if (canvas != undefined && circuit != undefined) {
			renderCircuit();
		}
	}

	function fetchDefinition(id: number): ComponentDefinition {
		return definitionLoaderService.getDefinition(id).unwrap();
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
