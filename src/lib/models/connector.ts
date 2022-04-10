import { jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class  Connector{
    
    @jsonMember(Number)
    componentId: Number;

    @jsonMember(Number)
    pin: number;
}