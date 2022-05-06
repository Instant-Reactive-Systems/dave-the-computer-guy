import type { Component } from '$lib/models/component'
import { fabric } from 'fabric'
import type { RenderableComponent } from './renderable_component';
import type { UserEvent } from '$lib/models/user_event';



export class GenericComponentRenderable implements RenderableComponent {
    static readonly BASE_SIZE = 150;
    component: Component;
    fabricObject: fabric.Object;
    canvas: fabric.Canvas;
    left: number;
    top: number;
    pins: fabric.Object[];

    constructor(left: number, top: number, component: Component) {
        this.component = component;
        this.top = top;
        this.left = left;
        this.pins = [];
    }

    onClick(): UserEvent {
        return null;
    }

    updatePin(pinId: number, val: boolean) {
        console.log(pinId, this.component)
        if (val) {
            const pin = this.pins.find(pin => pin.data.value.pin == pinId);
            pin.set("fill", "green");
            pin.set("stroke", "green")
            pin.shadow = new fabric.Shadow({ color: "green", blur: 2, })
        } else {
            const pin = this.pins.find(pin => pin.data.value.pin == pinId)
            pin.set("fill", "black");
            pin.set("stroke", "black")
            pin.shadow = null;
        }
    }

    update(state: any) {
        // OVDJE SU UPDATE IZ GET STATE
    }

    calculateDimensions() {
        const BASE_HEIGHT_SIZE = GenericComponentRenderable.BASE_SIZE;
        const BASE_WIDTH_SIZE = GenericComponentRenderable.BASE_SIZE;
        let height = BASE_HEIGHT_SIZE + Math.max(this.component.definition.metadata.pinLocationMapping.left.length,
            this.component.definition.metadata.pinLocationMapping.left.length) * (BASE_HEIGHT_SIZE / 4);
        let width = BASE_WIDTH_SIZE + Math.max(this.component.definition.metadata.pinLocationMapping.top.length,
            this.component.definition.metadata.pinLocationMapping.bottom.length) * (BASE_WIDTH_SIZE / 4);
        return {
            height: height,
            width: width
        }
    }

    createPins(componentHeight: number, componentWidth: number) {
        let pins = {
            "top": [],
            "bottom": [],
            "left": [],
            "right": []
        };
        const pinLocationMapping = this.component.definition.metadata.pinLocationMapping;
        for (const namePinPair of pinLocationMapping.left) {
            const baseOffset = componentHeight / (pinLocationMapping.left.length + 1)
            const line = new fabric.Line([0, 0, 40, 0], { stroke: 'black' });
            const pinIndex = pinLocationMapping.left.indexOf(namePinPair);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(namePinPair.name, {
                originY: "bottom",
                fontSize: 18,
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left - 2,
                top: line.top - 4,
                fill: "black",
                radius: 4,
                data: {
                    "type": "pin",
                    "pinType": this.component.definition.pins.input.includes(namePinPair.name) ? "input" : "output",
                    "value": namePinPair,
                    "component": this.component,
                    "location": "left"
                }
            });

            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: - 40,
                top: (pinOffset - lineText.height),
                subTargetCheck: true,
                data: {
                    type: "pinGroup",
                    pin: pinConnectionPoint
                }
            });

            pins.left.push(pinGroup);
            this.pins.push(pinConnectionPoint);
        }

        for (const namePinPair of pinLocationMapping.right) {
            const baseOffset = componentHeight / (pinLocationMapping.right.length + 1)
            const line = new fabric.Line([0, 0, 40, 0], { stroke: 'black' });
            const pinIndex = pinLocationMapping.right.indexOf(namePinPair);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(namePinPair.name, {
                originY: "bottom",
                fontSize: 18,
                left: line.width - 10

            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left + line.width - 2,
                top: line.top - 4,
                fill: "black",
                radius: 4,
                data: {
                    "type": "pin",
                    "pinType": this.component.definition.pins.input.includes(namePinPair.name) ? "input" : "output",
                    "value": namePinPair,
                    "component": this.component,
                    "location": "right"
                }
            });
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: componentWidth,
                top: (pinOffset - lineText.height),
                subTargetCheck: true,
                data: {
                    type: "pinGroup",
                    pin: pinConnectionPoint
                }
            });

            pins.right.push(pinGroup);
            this.pins.push(pinConnectionPoint);
        }

        for (const namePinPair of pinLocationMapping.bottom) {
            const baseOffset = componentWidth / (pinLocationMapping.bottom.length + 1);
            const line = new fabric.Line([0, 0, 0, -40], { stroke: 'black' });
            const pinIndex = pinLocationMapping.bottom.indexOf(namePinPair);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(namePinPair.name, {
                fontSize: 18,
                originX: "right",
                left: -20,
                top: -15,
                angle: 270
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left + line.width - 4,
                top: line.top + line.height,
                fill: "black",
                radius: 4,
                perPixelTargetFind: true,
                data: {
                    "type": "pin",
                    "pinType": this.component.definition.pins.input.includes(namePinPair.name) ? "input" : "output",
                    "value": namePinPair,
                    "component": this.component,
                    "location": "bottom"
                }
            });
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: (pinOffset - lineText.height),
                top: componentHeight,
                subTargetCheck: true,
                data: {
                    type: "pinGroup",
                    pin: pinConnectionPoint
                }
            });

            pins.bottom.push(pinGroup);
            this.pins.push(pinConnectionPoint);
        }

        for (const namePinPair of pinLocationMapping.top) {
            const baseOffset = componentWidth / (pinLocationMapping.top.length + 1);
            const line = new fabric.Line([0, 0, 0, -40], { stroke: 'black' });
            const pinIndex = pinLocationMapping.top.indexOf(namePinPair);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(namePinPair.name, {
                fontSize: 18,
                originX: "right",
                left: -10,
                top: -line.height,
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left - 4,
                top: line.top - 4,
                fill: "black",
                radius: 4,
                data: {
                    "type": "pin",
                    "pinType": this.component.definition.pins.input.includes(namePinPair.name) ? "input" : "output",
                    "value": namePinPair,
                    "component": this.component,
                    "location": "bottom"
                }
            });
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: (pinOffset - lineText.height),
                top: -(line.height),
                subTargetCheck: true,
                data: {
                    type: "pinGroup",
                    pin: pinConnectionPoint
                }
            });

            pins.top.push(pinGroup);
            this.pins.push(pinConnectionPoint);
        }

        return pins;
    }

    buildFabricObject(): fabric.Object {
        let dimensions = this.calculateDimensions();
        let componentOutline = new fabric.Rect({
            height: dimensions.height,
            width: dimensions.width,
            fill: "transparent",
            stroke: "black",
            strokeWidth: 1,
            strokeUniform: true,
            hasControls: false,
            hasBorders: false,
        });

        let componentText = new fabric.Text(this.component.definition.name.substring(0, 4), {
            originX: 'center', originY: 'center',
            left: 0.5 * componentOutline.width, top: 0.5 * componentOutline.height,
            fontSize: 40
        });


        let pins = this.createPins(componentOutline.height, componentOutline.width);

        this.fabricObject = new fabric.Group([componentOutline, componentText, ...pins.left, ...pins.right, ...pins.top], {
            left: this.left,
            top: this.top,
            subTargetCheck: true,

        });
        this.fabricObject.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: false,
        });
        this.fabricObject.data = {
            type: 'component',
            ref: this
        }

        return this.fabricObject;
    }

}
