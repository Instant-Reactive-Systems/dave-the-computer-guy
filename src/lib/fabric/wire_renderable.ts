import type { WiringRenderingData } from "$lib/models/circuit";
import type { Wire } from "$lib/models/wire";
import { fabric } from 'fabric'


export class WireRenderable {
    wiringRenderingData: WiringRenderingData;

    constructor(wiringRenderingData: WiringRenderingData) {
        this.wiringRenderingData = wiringRenderingData;
    }

    buildFabricObject(): fabric.Object {
        const points = this.wiringRenderingData.wires.flatMap(wire => [{ x: wire.startX, y: wire.startX }, { x: wire.endX, y: wire.endY }])
        return new fabric.Polyline(points, {
            stroke: "black",
            strokeWidth: 2,
            hasControls: false,
            selectable: false,
            data: this,
            type: "wire",
        });
    }
}