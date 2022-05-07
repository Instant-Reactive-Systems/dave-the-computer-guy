import { fabric } from 'fabric'
import { createConnector, createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import type {RenderableComponent} from './renderable_component';
import type { Component } from '$lib/models/component';
import type { UserEvent } from '$lib/models/user_event';

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

    updatePin(pinId: number,val: boolean) {
        console.log(pinId,this.component)
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

    onClick(): UserEvent {
        const currentFill = this.outline.get("fill");
        console.log("current fill", currentFill);
        if(currentFill != "black"){
            this.outline.set("fill", "black");
        }else{
            this.outline.set("fill", "transparent");
        }

        const event:UserEvent = {
               componentId: this.component.id,
               payload: "toggle"
        }
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
