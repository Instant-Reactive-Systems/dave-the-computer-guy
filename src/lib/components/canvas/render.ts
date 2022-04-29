import {createComponent} from '$lib/fabric/component_factory';
import type {Circuit} from '$lib/models/circuit';
import {Component} from '$lib/models/component';
import type {ComponentDefinition} from '$lib/models/component_definition';
import type {Wire} from '$lib/models/wire';
import {assert, todo} from '$lib/util/common';
import type { fabric } from 'fabric';

export class Canvas {
    private canvas: fabric.Canvas;
    public components: Map<number, fabric.Object>;
    public wires: Map<number, fabric.Object>;

    public constructor(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.components = new Map();
        this.wires = new Map();
    }

    public render(circuit: Circuit, definitions: Map<number, ComponentDefinition>) {
        this.clear();
        try {
			const components = circuit.components.map((c) => {
                return new Component(c.id, definitions.get(c.definitionId));
            });
			const wires = circuit.metadata.rendering.wires;
			const junctions = circuit.metadata.rendering.junctions;

			this.renderComponents(circuit, components);
			renderWires(wires);
			renderJunctions(junctions);
		} catch (err) {
			console.error(err);
			//showErrorNotification(err);
		}
        // TODO: Handle wire
        // if (mode.type == 'wire') {
		//  showTemporaryJunction();
	    // }
    }

    private clear() {
        this.canvas.clear();
        this.components = new Map();
        this.wires = new Map();
    }

    private renderComponents(circuit: Circuit, components: Component[]) {
        for (const component of components) {
			const renderingData = circuit.metadata.rendering.components[component.id];
			const fabricComponent = createComponent(
				renderingData.x,
				renderingData.y,
				component
			).buildFabricObject();

			this.canvas.add(fabricComponent);
			this.components.set(component.id, fabricComponent);
        }
    }

    private renderWire() {
        const wire = 
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
