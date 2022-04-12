<script lang="ts">
	import { circuitStore } from '$lib/stores/circuit';
	import { fabric } from 'fabric';
    import { stringify } from 'postcss';
	import { onMount } from 'svelte';

	let circuit = $circuitStore;
	let canvas: fabric.Canvas;
	let canvasElement;

	$:{
		
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
		canvas = new fabric.Canvas();
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
