import { jsonMember, jsonObject } from "typedjson"

@jsonObject
export class Item{
    @jsonMember(Number)
    componentDefinitionId: number;

    @jsonMember(Number)
    amount: number;
}



