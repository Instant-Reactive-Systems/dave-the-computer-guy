import { jsonMember, jsonObject } from "typedjson";


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

