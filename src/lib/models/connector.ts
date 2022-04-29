import { jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class Connector{
    @jsonMember(Number)
    componentId: number;

    @jsonMember(Number)
    pin: number;

    constructor(componentId:number,pin:number){
        this.componentId = componentId;
        this.pin = pin;
    }
}

export type ConnectorType = 'input' | 'output' | 'bidirectional';

