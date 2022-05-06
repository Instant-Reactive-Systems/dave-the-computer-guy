import type { Junction } from "$lib/models/circuit";
import { normalizeLook } from "$lib/util/fabric_utils";
import { fabric } from 'fabric'



export class JunctionRenderable {
	fabricObject: fabric.Object;
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
		this.fabricObject = obj;
        return obj;
    }

	update(val: boolean){
		if (val) {
            this.fabricObject.set("fill", "green");
            this.fabricObject.set("stroke", "green")
            this.fabricObject.shadow = new fabric.Shadow({ color: "green", blur: 2, })
        } else {
            this.fabricObject.set("fill", "black");
            this.fabricObject.set("stroke", "black")
            this.fabricObject.shadow = null;
        }
	}
}
