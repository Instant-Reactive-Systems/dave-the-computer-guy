import { jsonMember, jsonObject, toJson } from "typedjson"

@toJson
@jsonObject
export class Item{
    @jsonMember(Number)
    componentDefinitionId: number;

    @jsonMember(Number)
    amount: number;
}



