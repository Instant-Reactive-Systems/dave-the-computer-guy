import { jsonMember, jsonObject, toJson } from "typedjson"

@toJson
@jsonObject
export class ComponentRef {
    @jsonMember(Number)
    id: number;

    @jsonMember(Number)
    definitionId: number;

    constructor(id: number, definitionId: number) {
        this.id = id;
        this.definitionId = definitionId;
    }
}

