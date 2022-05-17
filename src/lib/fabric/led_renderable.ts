import { fabric } from 'fabric'
import { createConnector, normalizeLook } from '$lib/util/fabric_utils';
import type { Component } from '../models/component'
import type { RenderableComponent } from './renderable_component';
import type { UserEvent } from '$lib/models/user_event';

export class LedRenderable implements RenderableComponent {
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
        return null;
    }


    setPinConnected(pinId: number, connected: boolean): void {
        if (connected) {
            const pin = this.pins.find(pin => pin.data.value.pin == pinId);
            pin.set("fill", "#3B82F6");
            pin.set("stroke", "#3B82F6")
            pin.shadow = new fabric.Shadow({ color: "#3B82F6", blur: 2, })
        } else {
            const pin = this.pins.find(pin => pin.data.value.pin == pinId)
            pin.set("fill", "black");
            pin.set("stroke", "black")
            pin.shadow = null;
        }
    }

    updatePin(pinId: number,val: boolean) {
        if(val){
            const pin = this.pins.find(pin => pin.data.value.pin == pinId);
            pin.set("fill", "green");
            pin.set("stroke","green")
            pin.shadow = new fabric.Shadow({ color: "green", blur: 2, })
        }else{
            const pin = this.pins.find(pin => pin.data.value.pin == pinId)
            pin.set("fill", "black");
            pin.set("stroke","black")
            pin.shadow = null;
        }
    }

    update(state: any) {
        const fill = state.value ? 'red' : 'transparent';
        this.outline.set("fill", fill);
    }

    buildFabricObject(): fabric.Object {
        let outline = new fabric.Circle({
            radius: 20,
            fill: 'transparent',
            strokeUniform: true,
        });
        normalizeLook(outline);
        this.outline = outline;

        let a = createConnector("A", 0, -35, 16.5, 'input', this.component, 'left');
        this.pins = [a.item(1)];

        this.fabricObject = new fabric.Group([outline, a], {
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
