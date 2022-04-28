import type { Junction } from "$lib/models/circuit";
import {disableInteractivity, normalizeLook} from "$lib/util/fabric_utils";
import { fabric } from 'fabric'


export class JunctionRenderable {
    junction: Junction;

    constructor(junction: Junction) {
        this.junction = junction;
    }

    buildFabricObject(): fabric.Object {
        const obj = new fabric.Circle({
			radius: 4,
			selectable: false,
			fill: 'black',
			top: this.junction.y - 4,
			left: this.junction.x - 4,
			data: {
				ref: this,
				type: 'junction'
			}
		});

        normalizeLook(obj);
        return obj;
    }
}
