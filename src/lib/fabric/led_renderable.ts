import { fabric } from 'fabric'
import { createConnector, createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import { assert, todo } from '$lib/util/common';
import type { Component } from '../models/component'
import type {RenderableComponent} from './renderable_component';
import type { UserEvent } from '$lib/models/user_event';

export class LedRenderable implements RenderableComponent {
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

    onClick(): UserEvent {
        return null;
    }

    update(state: any) {
        const fill = state.value ? "red" : "transparent"
        console.log("Updating led state",fill);
        (this.fabricObject as fabric.Group).item(0).set("fill",fill);
    }

    buildFabricObject(): fabric.Object {
        let outline = new fabric.Circle({
            radius: 20,
            fill: 'transparent',
            strokeUniform: true,
        });
        normalizeLook(outline);

        let a = createConnector("A", 0, -35, 16.5, 'input', this.component, 'left');

        this.fabricObject = new fabric.Group([outline, a], {
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
