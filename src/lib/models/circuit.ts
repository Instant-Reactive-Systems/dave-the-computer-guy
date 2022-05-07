import type { Connection } from "./connection"
import type { Param } from "./param"
import type { Wire } from "./wire"
import type { ComponentRef } from "./component_ref"
import type { Connector } from "./connector"




export function defaultCircuit(): Circuit {
    return {
        id: 1,
        name: "",
        description: "",
        components: [],
        connections: [],
        params: undefined,
        metadata: {
            createdAt: new Date(),
            modifiedAt: new Date(),
            rendering: {
                components: [],
                wires: [],
                junctions: [],
                wiringRendering: new Map<string, WiringRenderingEntry>()
            }
        }
    }
}

export type ComponentRenderingData = {
    id: number;
    x: number;
    y: number;
}


export type Junction = {
    x: number;
    y: number;
    sourceWire: number;
}


export type WiringRenderingEntry = {
    wires: number[];
    connectors: Connector[]
    junctions: Junction[]
}

export type RenderingMetadata = {
    components: ComponentRenderingData[]
    wires: Wire[];
    junctions: Junction[];
    wiringRendering: Map<string, WiringRenderingEntry>;
}

export type CircuitMetadata = {
    rendering: RenderingMetadata;
    createdAt: Date;
    modifiedAt: Date;
}

export type Circuit = {
    id: number;
    name: string;
    description: string;
    components: ComponentRef[];
    connections: Connection[];
    params: Param[];
    metadata: CircuitMetadata;
}
