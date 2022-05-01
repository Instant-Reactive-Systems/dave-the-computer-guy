import { AnyT, jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson";
import type { Connector } from "./connector";

@toJson
@jsonObject
export class DirectLink {
  @jsonMember(String)
  type: 'pin' | 'wire';

  @jsonMember(AnyT)
  value: {conn: Connector, type: 'input' | 'output'} | number
}

@toJson
@jsonObject
export class Wire {
  @jsonMember(Number)
  id: number;

  @jsonMember(Number)
  startX: number;

  @jsonMember(Number)
  startY: number;

  @jsonMember(Number)
  endX: number;

  @jsonMember(Number)
  endY: number;

  @jsonArrayMember(DirectLink)
  links: DirectLink[]

}

