import { jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson";
import { Connection } from "./connection"

@toJson
@jsonObject
export class Junction {
    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;
    
    @jsonArrayMember(Connection)
    sourceConnections: Connection[]
}


