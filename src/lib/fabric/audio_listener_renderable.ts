import { fabric } from 'fabric'
import { createConnector, normalizeLook } from '$lib/util/fabric_utils';
import type { RenderableComponent } from './renderable_component';
import type { Component } from '$lib/models/component';
import type { UserEvent } from '$lib/models/user_event';
import { SIMULATOR_SERVICE } from '$lib/services/service';
import type { SimulatorService } from '$lib/services/simulator_service';

export class AudioListenerRenderable implements RenderableComponent {
    component: Component;
    left: number;
    top: number;
    fabricObject: fabric.Object;
    outline: fabric.Object;
    pins: fabric.Object[];
    intervalId: number;
    simulatorService: SimulatorService;

    constructor(left: number, top: number, component: Component) {
        this.left = left;
        this.top = top;
        this.component = component;

        navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;

            source.connect(analyser);

            let bytes = new Float32Array(analyser.fftSize);
            this.intervalId = setInterval(() => {
                analyser.getFloatFrequencyData(bytes);
                this.simulatorService.insertUserEvent({
                    componentId: this.component.id,
                    payload: bytes,
                });
            }, 1000);
        });
    }

    dispose(): void {
        clearInterval(this.intervalId);
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

    onClick(): UserEvent {
        const currentFill = this.outline.get("fill");
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
