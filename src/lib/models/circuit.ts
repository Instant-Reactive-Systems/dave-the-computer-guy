import type { Option } from "ts-results"
import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson"
import { Connection } from "./connection"
import { Param } from "./param"
import { Wire } from "./wire"
import { ComponentRef } from "./component_ref"


@toJson
@jsonObject
export class ComponentRenderingData {
    @jsonMember(Number)
    id: number

    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;
}


@toJson
@jsonObject
export class Junction {
    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;

    @jsonMember(Number)
    sourceWire: number

    constructor(x: number, y:number, source: number){
        this.x = x;
        this.y = y;
        this.sourceWire = source;
    }
}

@toJson
@jsonObject
export class RenderingMetadata {
    @jsonArrayMember(ComponentRenderingData)
    components: ComponentRenderingData[];

    @jsonArrayMember(Wire)
    wires: Wire[];

    @jsonArrayMember(Junction)
    junctions: Junction[]
}



@toJson
@jsonObject
export class CircuitMetadata {
    @jsonMember(RenderingMetadata)
    rendering: RenderingMetadata;
    @jsonMember(Date)
    createdAt: Date;
    @jsonMember(Date)
    modifiedAt: Date;
}

@toJson
@jsonObject
export class Circuit {
    @jsonMember(Number)
    id: number;

    @jsonMember(String)
    name: string;

    @jsonMember(String)
    description: string;

    @jsonArrayMember(ComponentRef)
    components: ComponentRef[];

    @jsonMember(Connection)
    connections: Connection[];

    @jsonArrayMember(Param)
    params: Param[];

    @jsonMember(CircuitMetadata)
    metadata: CircuitMetadata;

    constructor() {
        this.id = 0;
        this.name = "";
        this.description = "";
        this.components = [];
        this.connections = [];
        this.params = undefined;
        const metadata: CircuitMetadata = new CircuitMetadata();
        metadata.createdAt = new Date();
        metadata.modifiedAt = new Date();
        const rendering: RenderingMetadata = new RenderingMetadata();
        rendering.components = [];
        rendering.wires = [];
        rendering.junctions = [];
        metadata.rendering = rendering;
        this.metadata = metadata;
    }
}

