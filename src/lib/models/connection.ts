import { jsonArrayMember, jsonMember, jsonObject } from "typedjson";
import { Connector } from "./connector"

@jsonObject
export class Connection{
    
    @jsonMember(Connector)
    from: Connector;

    @jsonArrayMember(Connector)
    to: Connector[]
}