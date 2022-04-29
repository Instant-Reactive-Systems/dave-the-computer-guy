import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson";
import { Connector, type ConnectorType } from "./connector";
import type { Point } from "./point";

@toJson
@jsonObject
export class ConnectorRef {
    @jsonMember(Connector)
    value: Connector;

    @jsonMember(String)
    type: ConnectorType;
}

export type JunctionId = number;
export type JunctionType = 'junction' | 'connector';

@toJson
@jsonObject
export class Junction {
    id: JunctionId;
    type: JunctionType;

    // List of junction IDs
    connected: JunctionId[];
}

@toJson
@jsonObject
export class Segment {
    wire: Wire;

    start: Point;
    end: Point;

    from: JunctionId;
    to: JunctionId;
}

@toJson
@jsonObject
export class Wire {
    id: number;
    inputConnectors: ConnectorRef[];
    outputConnectors: ConnectorRef[];
    junctions: Map<JunctionId, Junction>;
    segments: Segment[];
}

