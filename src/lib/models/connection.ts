import { jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson";
import { Connector } from "./connector"

@toJson
@jsonObject
export class Connection {

    @jsonMember(Connector)
    from: Connector;

    @jsonArrayMember(Connector)
    to: Connector[]

    constructor(from: Connector, to: Connector[]) {
        this.from = from;
        this.to = to;
    }
}