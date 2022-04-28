import {createComponent} from '$lib/fabric/component_factory';
import {JunctionRenderable} from '$lib/fabric/junction_renderable';
import {WireRenderable} from '$lib/fabric/wire_renderable';
import type {Circuit, Junction} from '$lib/models/circuit';
import {Component} from '$lib/models/component';
import type {ComponentDefinition} from '$lib/models/component_definition';
import type {Size} from '$lib/models/size';
import type {Wire} from '$lib/models/wire';
import type {WiringState} from '$lib/models/wiring_state';
import {assert, todo} from '$lib/util/common';
import type { fabric } from 'fabric';
import type { EditorMode } from '$lib/models/editor_mode';

type EventHandlerType = (event: fabric.IEvent) => void;

type RenderingContext = {
    mode: EditorMode,
};

export class Canvas {
    private canvas: fabric.Canvas;
    public components: Map<number, fabric.Object>;
    public wires: Map<number, fabric.Object>;

    public constructor(canvas: fabric.Canvas, size: Size) {
        this.canvas = canvas;
        this.components = new Map();
        this.wires = new Map();

		this.setupZoom();
		this.resize(size);
    }

    public render(circuit: Circuit, definitions: Map<number, ComponentDefinition>, ctx: RenderingContext) {
        this.clear();
		const components = circuit.components.map((c) => {
            return new Component(c.id, definitions.get(c.definitionId));
        });
		const wires = circuit.metadata.rendering.wires;
		const junctions = circuit.metadata.rendering.junctions;

		this.renderComponents(circuit, components);
		this.renderWires(wires);
		this.renderJunctions(junctions);


        // TODO: Handle wire
        // if (mode.type == 'wire') {
		//  showTemporaryJunction();
	    // }
    }

    public resize(size: Size) {
		this.canvas.setDimensions(size);
    }

    public on(eventName: string, handler: EventHandlerType) {
        this.canvas.on(eventName, handler);
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

    private renderWires(wires: Wire[]) {
        for (const wire of wires.values()) {
            const fabricWire = new WireRenderable(wire).buildFabricObject();
		    this.canvas.add(fabricWire);
		    this.wires.set(wire.id, fabricWire);
        }
    }

    private renderJunctions(junctions: Junction[]) {
        for (const junction of junctions) {
            const junctionRenderable = new JunctionRenderable(junction);
            const fabricJunction = junctionRenderable.buildFabricObject();
            this.canvas.add(fabricJunction);
        }
    }

    private renderWiringState(state: WiringState) {
		todo();
	}

    private setupZoom() {
		this.canvas.on('mouse:wheel', (opt) => {
			var delta = opt.e.deltaY;
			var zoom = this.canvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.01) zoom = 0.01;
			this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			opt.e.preventDefault();
			opt.e.stopPropagation();
		});
	}

    private renderEditorMode(mode: EditorMode) {
        if (mode == null) return;

        switch (mode.type) {
            case 'wire': {
                if (mode.data.currentWire != null) this.canvas.add(mode.data.currentWire);
                if (mode.data.currentJunction != null) this.canvas.add(mode.data.currentJunction);

                break;
            }
        }
    }
}

