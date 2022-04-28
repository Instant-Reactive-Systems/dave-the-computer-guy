import { fabric } from 'fabric'
import { createConnector, createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import { assert, todo } from '$lib/util/common';
import type {RenderableComponent} from './renderable_component';
import type { Component } from '$lib/models/component';
import type { UserEvent } from '$lib/models/user_event';

export class NandRenderable implements RenderableComponent {
    component: Component;
    left: number;
    top: number;
    fabricObject: fabric.Object;
    pins: fabric.Object[];

    static readonly SVG: string = `
    <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0' y='0' width='30' height='30' viewPort='0 0 30 30'>
        <path vector-effect='non-scaling-stroke' d='M 4 4 V 20 V 4 C 20 4, 20 20, 4 20 V 4' stroke='black' stroke-width='1' fill='transparent'/>
        <circle vector-effect='non-scaling-stroke' cx='17' cy='12' r='1' stroke='black' stroke-width='1' fill='transparent' />
    </svg>`;

    constructor(left: number, top: number, component: Component) {
        this.left = left;
        this.top = top;
        this.component = component;
    }

    onClick(): UserEvent {
        return null;
    }

    update(state: any) {
        // none
    }

    buildFabricObject(): fabric.Object {
        let outline = loadSvg(NandRenderable.SVG);
        normalizeLook(outline);
        outline.scale(8);

        let a = createConnector("A", 0, -24, 40, 'input', this.component, 'left');
        let b = createConnector("B", 1, -24, 110, 'input', this.component, 'left');
        let y = createConnector("Y", 2, 123, 72, 'output', this.component, 'right');
        this.pins = [a.item(1), b.item(1), y.item(1)];

        this.fabricObject = new fabric.Group([outline, a, b, y], {
            left: this.left,
            top: this.top,
            subTargetCheck: true,
        });
        
        normalizeLook(this.fabricObject);

        // Embed metadata
        this.fabricObject.data = {
            type: 'component',
            ref: this
        };
        
        return this.fabricObject;
    }
}
