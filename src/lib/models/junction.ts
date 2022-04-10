import { jsonArrayMember, jsonMapMember, jsonMember, jsonObject } from "typedjson";
import { Connection } from "./connection"

@jsonObject
export class Junction {
    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;
    
    @jsonArrayMember(Connection)
    sourceConnections: Connection[]
}


