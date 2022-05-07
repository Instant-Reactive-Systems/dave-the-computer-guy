import type { DirectLink, Wire } from "./wire";
import type { Junction } from "./circuit";
import type { Component } from "./component";

export type EditorMode = {
    type: EditorModeType;
    data: DeleteData | WireData | EditData | null;
};

export type EditorModeType = 'delete' | 'wire' | 'edit' | 'running' | 'paused';

export type DeleteData = 'pressed' | 'released';

export type WireData = {
    source: DirectLink,
    lastX: number,
    lastY: number,
    currentWire: Wire,
    currentJunction: Junction,
};

export type EditData = {
    component: Component,
};

export function defaultDeleteMode(): EditorMode {
    return {
        type: 'delete',
        data: null,
    }
};

export function defaultWireMode(): EditorMode {
    return {
        type: 'wire',
        data: {
            source: null,
            lastX: null,
            lastY: null,
            currentWire: null,
            currentJunction: null
        }
    }
};

export function defaultEditorMode(): EditorMode {
    return {
        type: 'edit',
        data: {
            component: null,
        },
    }
};

export function defaultRunningMode(): EditorMode {
    return {
        type: 'running',
        data: null,
    }
};

export function defaultPausedMode(): EditorMode {
    return {
        type: 'paused',
        data: null,
    }
};
