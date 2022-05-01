import { AnyT, jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class Param{

    @jsonMember(Number)
    id: number;

    @jsonMember(AnyT)
    data: any;
}


