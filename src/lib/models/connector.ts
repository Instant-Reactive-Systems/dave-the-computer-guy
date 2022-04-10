import { jsonMember, jsonObject } from "typedjson";


@jsonObject
export class  Connector{
    @jsonMember(Number)
    componentId: Number;

    @jsonMember(Number)
    pin: number;
}