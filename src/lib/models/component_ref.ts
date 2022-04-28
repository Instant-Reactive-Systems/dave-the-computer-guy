import { jsonMember, jsonObject, toJson } from "typedjson"

@toJson
@jsonObject
export class ComponentRef {
    @jsonMember(Number)
    id: number;

    @jsonMember(Number)
    definitionId: number;
}

