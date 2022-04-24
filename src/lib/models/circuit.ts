import type { Option } from "ts-results"
import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson"
import { Connection } from "./connection"
import { Param } from "./param"
import { Wire } from "./wire"


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
export class Component {
    @jsonMember(Number)
    id: number;

    @jsonMember(Number)
    definitionId: number;


    constructor(id: number, definitionId: number) {
        this.id = id;
        this.definitionId = definitionId;
    }
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

    @jsonArrayMember(Component)
    components: Component[];

    @jsonMember(Connection)
    connections: Connection[];

    @jsonArrayMember(Param)
    params: Param[];

    @jsonMember(CircuitMetadata)
    metadata: CircuitMetadata;

    constructor() {
        this.id = 0;
        this.name = 'test';
        this.description = 'testdesc';
        this.components = [];
        this.connections = [];
        this.params = [];
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

