import { fabric } from 'fabric'
import type { PinType } from '$lib/models/pin_type';
import { NameAndPinPair } from '$lib/models/component_definition';
import type {Component} from '$lib/models/circuit';
import {assert} from './common';
import type {Direction} from '$lib/models/direction';

/// Returns the first parsed SVG object that Fabric parses from a string.
export function loadSvg(str: string): fabric.Object {
    let objs = [];
    fabric.loadSVGFromString(str, (res) => objs.push(fabric.util.groupSVGElements(res)));
    assert(objs.length > 0, 'No SVG found in string');

    return objs[0];
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
    obj.strokeWidth = 1;
}

export function createPinObject(name: string, id: number, x: number, y: number, type: PinType, component: Component): fabric.Object {
    const pin = new fabric.Circle({
        left: x,
        top: y,
        fill: "black",
        radius: 3,
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

export function createConnector(name: string, id: number, x: number, y: number, type: PinType, component: Component, direction: Direction): fabric.Object {
    let lineCoords: number[];
    switch (direction) {
        case 'left': lineCoords = [0, 0, -30, 0]; break;
        case 'right': lineCoords = [0, 0, 30, 0]; break;
        case 'up': lineCoords = [0, 0, 0, -30]; break;
        case 'down': lineCoords = [0, 0, 0, 30]; break;
    }
    const connectorWire = new fabric.Line(lineCoords);
    connectorWire.setCoords();
    normalizeLook(connectorWire);

    let pinCoords: fabric.Point;
    switch (direction) {
        case 'left': pinCoords = connectorWire.oCoords.ml; pinCoords.x -= 5; pinCoords.y -= 3.5; break;
        case 'right': pinCoords = connectorWire.oCoords.mr; pinCoords.x -= 5; pinCoords.y -= 3.5; break;
        case 'up': pinCoords = connectorWire.oCoords.mt; pinCoords.x -= 5; pinCoords.y -= 3.5; break;
        case 'down': pinCoords = connectorWire.oCoords.mb; pinCoords.x -= 5; pinCoords.y -= 3.5; break;
    }
    const pin = createPinObject(name, id, pinCoords.x, pinCoords.y, type, component);

    const obj = new fabric.Group([pin, connectorWire], {
        left: x,
        top: y,
        subTargetCheck: true,
    });

    normalizeLook(obj);
    return obj;
}

