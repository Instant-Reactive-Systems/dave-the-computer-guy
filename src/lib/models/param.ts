import { AnyT, jsonMember, jsonObject } from "typedjson";

@jsonObject
export class Param{

    @jsonMember(Number)
    id: number;

    @jsonMember(AnyT)
    data: any;
}


