import { createComponent } from '$lib/fabric/component_factory';
import { JunctionRenderable } from '$lib/fabric/junction_renderable';
import { WireRenderable } from '$lib/fabric/wire_renderable';
import type { Circuit, Junction, WiringRenderingEntry } from '$lib/models/circuit';
import type { Component } from '$lib/models/component';
import type { ComponentDefinition } from '$lib/models/component_definition';
import type { Size } from '$lib/models/size';
import type { Wire } from '$lib/models/wire';
import type { WiringState } from '$lib/models/wiring_state';
import type { fabric } from 'fabric';
import type { EditorMode, WireData } from '$lib/models/editor_mode';
import type { RenderableComponent } from '$lib/fabric/renderable_component';
import type { Point } from '$lib/models/point';
import _ from 'lodash';

type EventHandlerType = (event: fabric.IEvent) => void;



export class Canvas {
    private canvas: fabric.Canvas;
    public components: Map<number, fabric.Object>;
    public wires: Map<number, fabric.Object>;
    public junctions: fabric.Object[]
    private tempWire?: fabric.Object;
    private tempJunction?: fabric.Object;

    public constructor(canvas: fabric.Canvas, size: Size) {
        this.canvas = canvas;
        this.components = new Map();
        this.wires = new Map();
        this.setupZoom();
        this.resize(size);
    }

    public render(circuit: Circuit, definitions: Map<number, ComponentDefinition>) {
        console.log("Rerendering whole circuit: ", circuit);
        this.clear();
        const components: Component[] = circuit.components.map((c) => {
            const component: Component = {
                id: c.id,
                definition: definitions.get(c.definitionId)

            }
            return component;
        });

        const wires = circuit.metadata.rendering.wires;
        const junctions = circuit.metadata.rendering.junctions;

        this.renderComponents(circuit, components);
        this.renderWires(wires);
        this.renderJunctions(junctions);
    }

    public resize(size: Size) {
        const ratio = this.canvas.getWidth() / this.canvas.getHeight();
        const scale = size.width / this.canvas.getWidth();
        const zoom  = this.canvas.getZoom() * scale;
        this.canvas.setDimensions({width: size.width, height: size.height / ratio});
        this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }

    public on(eventName: string, handler: EventHandlerType) {
        this.canvas.on(eventName, handler);
    }

    public renderEditorMode(mode: EditorMode) {
        switch (mode.type) {
            case 'wire': {
                if ((mode.data as WireData).currentWire != null) {
                    if (this.tempWire != null) this.canvas.remove(this.tempWire!);
                    const fabricWire = new WireRenderable((mode.data as WireData).currentWire).buildFabricObject();
                    fabricWire.data.isTemp = true;
                    this.tempWire = fabricWire;
                    this.canvas.add(this.tempWire);
                }
                if ((mode.data as WireData).currentJunction != null) {
                    if (this.tempJunction != null) this.canvas.remove(this.tempJunction!);
                    const fabricJunction = new JunctionRenderable((mode.data as WireData).currentJunction).buildFabricObject();
                    fabricJunction.data.isTemp = true
                    this.tempJunction = fabricJunction;
                    this.canvas.add(this.tempJunction);
                }

                break;
            }
            default: {
                if (this.tempWire != null) this.canvas.remove(this.tempWire!);
                if (this.tempJunction != null) this.canvas.remove(this.tempJunction!);
                this.tempWire = null;
                this.tempJunction = null;
            }
        }
    }

    public lockComponents() {
        this.canvas.getObjects().forEach((obj) => {
            if (obj.data.type == 'component') {
                obj.selectable = false;
                obj.lockMovementX = true;
                obj.lockMovementY = true;
            }
        });
        this.canvas.renderAll();
    }

    public unlockComponents() {
        this.canvas.getObjects().forEach((obj) => {
            if (obj.data.type == 'component') {
                obj.selectable = true;
                obj.lockMovementX = false;
                obj.lockMovementY = false;
            }
        });
        this.canvas.renderAll();
    }

    public updateComponent(id: number, state: any) {
        const component = this.components.get(id).data.ref as RenderableComponent;
        component.update(state);
    }

    public refresh() {
        this.canvas.requestRenderAll();
    }

    public getComponents(): RenderableComponent[] {
        return Array.from(this.components.values()).map((c) => c.data.ref);
    }

    public getObjects(): fabric.Object[] {
        return this.canvas.getObjects();
    }

    public getPointer(event: Event): Point {
        return this.canvas.getPointer(event);
    }

    public dispose() {
        this.canvas.dispose();
    }

    public requestRenderAll() {
        this.canvas.requestRenderAll();
    }

    public get isDragging(): boolean {
        return this.canvas.isDragging;
    }

    public set isDragging(value) {
        this.canvas.isDragging = value;
    }

    public get selection(): boolean {
        return this.canvas.selection;
    }

    public set selection(value) {
        this.canvas.selection = value;
    }

    public get lastPosX(): number {
        return this.canvas.lastPosX;
    }

    public set lastPosX(value) {
        this.canvas.lastPosX = value;
    }

    public get lastPosY(): number {
        return this.canvas.lastPosY;
    }

    public set lastPosY(value) {
        this.canvas.lastPosY = value;
    }

    public get viewportTransform(): number[] {
        return this.canvas.viewportTransform;
    }

    public set viewportTransform(value) {
        this.canvas.viewportTransform = value;
    }

    public setViewportTransform(transform: number[]) {
        this.canvas.setViewportTransform(transform);
    }

    private clear() {
        this.canvas.clear();
        this.components = new Map();
        this.wires = new Map();
        this.tempWire = null;
        this.tempJunction = null;
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
        this.junctions = [];
        for (const junction of junctions) {
            const junctionRenderable = new JunctionRenderable(junction);
            const fabricJunction = junctionRenderable.buildFabricObject();
            this.junctions.push(fabricJunction);
            this.canvas.add(fabricJunction);
        }
    }

    public renderWiringState(state: WiringState, wiringRenderingEntries: Map<string, WiringRenderingEntry>) {
        for (const stateEntry of state) {
            const key = `${stateEntry.connector.componentId}-${stateEntry.connector.pin}`
            const wiringEntry = wiringRenderingEntries.get(key);
            if (wiringEntry == undefined) {
                continue;
            }
            for (const wireId of wiringEntry.wires) {
                this.wires.get(wireId).data.ref.update(stateEntry.value);
            }
            for (const connector of wiringEntry.connectors) {
                const renderableComponent: RenderableComponent = this.components.get(connector.componentId).data.ref as RenderableComponent;
                renderableComponent.updatePin(connector.pin, stateEntry.value);
            }
            for (const junction of wiringEntry.junctions) {
                const junctionRenderable: JunctionRenderable = this.junctions
                    .map(j => j.data.ref as JunctionRenderable)
                    .find(j => _.isEqual(j.junction, junction));
                junctionRenderable.update(stateEntry.value);
            }
        }
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
}

