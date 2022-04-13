import { jsonMember, jsonObject, toJson } from "typedjson";
import { ComponentDefinition } from "./component_definition"

@toJson
@jsonObject
export class Component {

    @jsonMember(Number)
    id: number;

    @jsonMember(ComponentDefinition)
    definition: ComponentDefinition;

    constructor(id: number, definition: ComponentDefinition) {
        this.id = id;
        this.definition = definition;
    }
}

