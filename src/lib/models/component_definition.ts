import type { Circuit, Param } from "./circuit";
import type { ComponentType } from "./component_type";
import type { Connector } from "./connector";

export type PinMapping = {
    input: Connector[][];
    output: Connector[][];
}

export type NameAndPinPair = {
    name: string;
    pin: number;
}

export type PinLocationMapping = {
    top: NameAndPinPair[];
    bottom: NameAndPinPair[];
    left: NameAndPinPair[];
    right: NameAndPinPair[];
}



export type ComponentDefinitionMetadata = {
    pinLocationMapping: PinLocationMapping;
    createdAt: Date;
    modifiedAt: Date;
    imageUrl: string;
}

export type Pins = {
    input: string[];
    output: string[];
}


export function defaultComponentDefinition(): ComponentDefinition {
    return {
        id: 0,
        name: '',
        type: 'Transparent',
        description: '',
        pinMapping: null,
        pins: { input: [], output: [] },
        circuit: null,
        truthTable: null,
        booleanFunction: null,
        metadata: {
            pinLocationMapping: {
                left: [],
                top: [],
                right: [],
                bottom: [],
            },
            createdAt: new Date(),
            modifiedAt: new Date(),
            imageUrl: ''
        },
        params: null,
    }
}

export type ComponentDefinition = {
    id: number;
    name: string;
    type: ComponentType;
    description: string;
    pinMapping: PinMapping;
    pins: Pins;
    circuit: Circuit;
    truthTable: boolean[][];
    booleanFunction: string;
    metadata: ComponentDefinitionMetadata;
    params: Param,
}

export function commonParams(): Param {
    return {
        delay: 1,
    };
}

