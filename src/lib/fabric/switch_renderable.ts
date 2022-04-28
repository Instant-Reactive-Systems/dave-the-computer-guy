import { fabric } from 'fabric'
import { createConnector, createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import { assert, todo } from '$lib/util/common';
import type {RenderableComponent} from './renderable_component';
import type { Component } from '$lib/models/component';
import { UserEvent } from '$lib/models/user_event';
import type { Group } from 'fabric/fabric-impl';

export class SwitchRenderable implements RenderableComponent {
    component: Component;
    left: number;
    top: number;
    fabricObject: fabric.Object;
    outline: fabric.Object;
    pins: fabric.Object[];

    constructor(left: number, top: number, component: Component) {
        this.left = left;
        this.top = top;
        this.component = component;
    }

    onClick(): UserEvent {
        const currentFill = this.outline.get("fill");
        console.log("current fill", currentFill);
        if(currentFill != "black"){
            this.outline.set("fill", "black");
        }else{
            this.outline.set("fill", "transparent");
        }

        const event = new UserEvent(this.component.id, "toggle");
        return event;
    }

    update(state: any) {
        // none
    }

    buildFabricObject(): fabric.Object {
        let outline = new fabric.Rect({
            height: 75,
            width: 75,
            fill: 'transparent',
            strokeUniform: true,
        });
        normalizeLook(outline);
        this.outline = outline;

        let y = createConnector("Y", 0, 75, 35, 'output', this.component, 'right');
        this.pins = [y.item(1)];

        this.fabricObject = new fabric.Group([outline, y], {
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
