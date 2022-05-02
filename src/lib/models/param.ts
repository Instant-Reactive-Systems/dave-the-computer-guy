import { AnyT, jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class Param {
    @jsonMember(Number)
    id: number;

    @jsonMember(String)
    name: string;

    @jsonMember(AnyT)
    data: any;
}

