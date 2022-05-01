import { AnyT, jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class UserEvent {
    @jsonMember(Number)
    componentId: number;

    @jsonMember(AnyT)
    payload: any

    constructor(id: number, payload: any) {
        this.componentId = id;
        this.payload = payload;
    }
}