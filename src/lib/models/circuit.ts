import type { Option } from "ts-results"
import { AnyT, jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson"
import { Connection } from "./connection"
import { Junction } from "./junction"
import { Param } from "./param"
import { Wire } from "./wire"


@toJson
@jsonObject
export class ComponentRenderingData {
    @jsonMember(Number)
    id: number;

    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;
}


@toJson
@jsonObject
export class WiringRenderingData {
    @jsonMember(Connection)
    connection: Connection;
    @jsonArrayMember(Wire)
    wires: Wire[]
}

@toJson
@jsonObject
export class RenderingMetadata {
    @jsonMember(ComponentRenderingData)
    components: ComponentRenderingData;
    @jsonMember(WiringRenderingData)
    wiring: WiringRenderingData;
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

    @jsonMember (CircuitMetadata)
    metadata: CircuitMetadata;

}

