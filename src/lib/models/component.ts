import { jsonMember, jsonObject, toJson } from "typedjson";
import { ComponentDefinition } from "./component_definition"

@toJson
@jsonObject
export class Component{

    @jsonMember(Number)
    id: number;

    @jsonMember(ComponentDefinition)
    definition: ComponentDefinition;

}

