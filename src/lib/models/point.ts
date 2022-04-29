import {jsonMember, jsonObject, toJson} from "typedjson";

@toJson
@jsonObject
export class Point {
    @jsonMember(Number)
    x: number;

    @jsonMember(Number)
    y: number;
};

