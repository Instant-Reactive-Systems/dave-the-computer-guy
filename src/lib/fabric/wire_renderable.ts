import type { Wire } from "$lib/models/wire";
import { fabric } from 'fabric'




export class WireRenderable {
    wire: Wire;

    constructor(wire: Wire) {
        this.wire = wire;
    }

    buildFabricObject(): fabric.Object {
        /*
        const points = [this.wire.startX, this.wire.startY, this.wire.endX, this.wire.endY]
        return new fabric.Line(points, {
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
        */

        
    }


}
