import { fabric } from 'fabric'
import { createPinObject, loadSvg, normalizeLook } from '$lib/util/fabric_utils';
import { $todo, $try } from '$lib/util/macros';
import type {Component} from '$lib/models/circuit';
import type {RenderableComponent} from './renderable_component';

export class NandRenderable implements RenderableComponent {
    type: 'builtin';
    component: Component;
    left: number;
    top: number;
    fabricObject: fabric.Object;

    static readonly SVG: string = `
    <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0' y='0' width='24' height='24' viewPort='0 0 24 24'>
        <path vector-effect='non-scaling-stroke' d='M 4 4 V 20 V 4 C 20 4, 20 20, 4 20 V 4' stroke='black' stroke-width='4' fill='transparent'/>
    </svg>`;

    constructor(left: number, top: number, component: Component) {
        this.left = left;
        this.top = top;
        this.component = component;
    }

    onClick() {
        $todo!()
    }

    update(state: any) {
        $todo!()
    }

    buildFabricObject(): fabric.Object {
        let outline = $try!(loadSvg(NandRenderable.SVG));
        normalizeLook(outline);

        const a = createPinObject("A", 0, 4, 8, 'input', this.component);
        const b = createPinObject("B", 1, 4, 16, 'input', this.component);
        const y = createPinObject("Y", 2, 20, 18, 'output', this.component);

        this.fabricObject = new fabric.Group([outline, a, b, y], {
            left: this.left,
            top: this.top,
            subTargetCheck: true,
        });
        
        normalizeLook(this.fabricObject);

        // Embed metadata
        this.fabricObject.type = 'component';
        this.fabricObject.data = {
            type: 'NandRenderable',
            ref: this
        };
        
        return this.fabricObject;
    }
}
