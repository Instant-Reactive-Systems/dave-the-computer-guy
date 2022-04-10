import { jsonMember, jsonObject, toJson } from "typedjson";


@toJson
@jsonObject
export class Wire {
  @jsonMember(Number)
  startX: number;

  @jsonMember(Number)
  startY: number;

  @jsonMember(Number)
  endX: number;

  @jsonMember(Number)
  endY: number;
}

