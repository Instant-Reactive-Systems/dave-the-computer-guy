import type {DirectLink, Wire} from "./wire";
import type {Junction} from "./circuit";
import type {Component} from "./component";

export type EditorMode = {
    type: EditorModeType,
    data: DeleteData | WireData | EditData | null,
};

export type EditorModeType = 'delete' | 'wire' | 'edit' | 'running' | 'paused';

// TODO: Implement delete and use the data if necessary
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

export const DEFAULT_DELETE_MODE: EditorMode = {
    type: 'delete',
    data: null,
};

export const DEFAULT_WIRE_MODE: EditorMode = {
    type: 'wire',
	data: {
		source: null,
		lastX: null,
		lastY: null,
		currentWire: null,
    	currentJunction: null
	},
};

export const DEFAULT_EDIT_MODE: EditorMode = {
    type: 'edit',
	data: {
		component: null,
	},
};

export const DEFAULT_RUNNING_MODE: EditorMode = {
    type: 'running',
    data: null,
};

export const DEFAULT_PAUSED_MODE: EditorMode = {
    type: 'paused',
    data: null,
};

