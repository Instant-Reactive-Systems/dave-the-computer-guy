import { fabric } from 'fabric'
import { createConnector, createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import { assert, todo } from '$lib/util/common';
import type {RenderableComponent} from './renderable_component';
import type { Component } from '$lib/models/component';

export class SwitchRenderable implements RenderableComponent {
    type: 'builtin';
    component: Component;
    left: number;
    top: number;
    fabricObject: fabric.Object;

    constructor(left: number, top: number, component: Component) {
        this.left = left;
        this.top = top;
        this.component = component;
    }

    onClick() {
        todo()
    }

    update(state: any) {
        todo()
    }

    buildFabricObject(): fabric.Object {
        let outline = new fabric.Rect({
            height: 75,
            width: 75,
            fill: 'transparent',
            strokeUniform: true,
        });
        normalizeLook(outline);

        let y = createConnector("Y", 0, 75, 35, 'output', this.component, 'right');

        this.fabricObject = new fabric.Group([outline, y], {
            left: this.left,
            top: this.top,
            subTargetCheck: true,
        });
        
        normalizeLook(this.fabricObject);

        // Embed metadata
        this.fabricObject.type = 'component';
        this.fabricObject.data = {
            type: 'component',
            ref: this
        };
        
        return this.fabricObject;
    }
}
