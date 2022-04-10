import { jsonMember, jsonObject } from "typedjson";
import { ComponentDefinition } from "./component_definition"

@jsonObject
export class Component{

    @jsonMember(Number)
    id: number;

    @jsonMember(ComponentDefinition)
    definition: ComponentDefinition;
}

