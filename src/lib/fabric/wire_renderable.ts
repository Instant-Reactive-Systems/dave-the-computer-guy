import type { Wire } from "$lib/models/wire";
import { fabric } from 'fabric'


export class WireRenderable {
    wire: Wire;
    fabricObject: fabric.Object;

    constructor(wire: Wire) {
        this.wire = wire;
    }

    buildFabricObject(): fabric.Object {
        const points = [this.wire.startX, this.wire.startY, this.wire.endX, this.wire.endY]
        this.fabricObject = new fabric.Line(points, {
            stroke: "black",
            strokeWidth: 1,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            selectable: false,
            data: {
                ref: this,
                type: "wire"
            },
            type: "wire",
            perPixelTargetFind: false,
            fill: "black"
        });
        return this.fabricObject;
    }

    update(val: boolean) {
        if (val) {
            this.fabricObject.set("stroke", "green");
            this.fabricObject.shadow = new fabric.Shadow({ color: "green", blur: 5, affectStroke: true, })
        } else {
            this.fabricObject.set("stroke", "black")
            this.fabricObject.shadow = null;
        }
    }

}