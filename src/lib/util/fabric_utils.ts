import { fabric } from 'fabric'
import { Err, Ok, type Result } from "ts-results";
import type { PinType } from '$lib/models/pin_type';
import { NameAndPinPair } from '$lib/models/component_definition';
import type {Component} from '$lib/models/circuit';

/// Returns the first parsed SVG object that Fabric parses from a string.
export function loadSvg(str: string): Result<fabric.Object, Error> {
    let objs = [];
    fabric.loadSVGFromString(str, (res) => objs.push(res));

    if (objs.length < 1) return Err(new Error("No SVG found in string."));
    return Ok(objs[0]);
}

/// Removes the default Fabric object look (border, interact parts, ...).
export function normalizeLook(obj: fabric.Object) {
    obj.hasControls = false;
    obj.hasBorders = false;
    obj.setControlsVisibility({
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
    obj.stroke = "black";
    obj.strokeWidth = 4;
}

export function createPinObject(name: string, id: number, x: number, y: number, type: PinType, component: Component): fabric.Object {
    const pin = new fabric.Circle({
        left: x,
        top: y,
        fill: "black",
        radius: 4,
        data: {
            "type": "pin",
            "pinType": type,
            "value": { name, id },
            "component": component
        }
    });

    normalizeLook(pin);

    return pin;
}
