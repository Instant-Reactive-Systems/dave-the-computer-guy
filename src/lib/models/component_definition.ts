import type { Input } from "postcss"
import type { Option } from "ts-results"
import { jsonArrayMember, jsonMapMember, jsonMember, jsonObject, JsonObjectMetadata, toJson } from "typedjson"
import { Circuit, CircuitMetadata } from "./circuit"
import type { ComponentType } from "./component_type"
import { Connection } from "./connection"
import { Connector } from "./connector"
import { Param } from "./param"


@toJson
@jsonObject
export class Component {

    @jsonMember(Number)
    id: number;

    @jsonMember(Number)
    definitionId: number;
}




@toJson
@jsonObject
export class PinsMapping {

    @jsonArrayMember(Connector, { dimensions: 2 })
    input: Connector[][];

    @jsonArrayMember(Connector, { dimensions: 2 })
    output: Connector[][];
}

@toJson
@jsonObject
export class NameAndPinPair{
    
    @jsonMember(String)
    name: string;

    @jsonMember(Number)
    pin: number;
}

@toJson
@jsonObject
export class PinLocationMapping{
    
    @jsonArrayMember(NameAndPinPair)
    top: NameAndPinPair[];

    @jsonArrayMember(NameAndPinPair)
    bottom: NameAndPinPair[];

    @jsonArrayMember(NameAndPinPair)
    left: NameAndPinPair[];

    @jsonArrayMember(NameAndPinPair)
    right: NameAndPinPair[];

}



@toJson
@jsonObject
export class ComponentDefinitionMetadata{

    @jsonMember(PinLocationMapping)
    pinLocationMapping: PinLocationMapping;

    @jsonMember(Date)
    createdAt: Date;

    @jsonMember(Date) 
    modifiedAt: Date;

}



@toJson
@jsonObject
export class Pins {

    @jsonArrayMember(String)
    input: string[];

    @jsonArrayMember(String)
    output: string[]
}

@toJson
@jsonObject
export class ComponentDefinition {

    @jsonMember(Number)
    id: number;

    @jsonMember(String)
    name: string;

    @jsonMember(String)
    type: ComponentType

    @jsonMember(String)
    description: string;

    @jsonMember(PinsMapping, { isRequired: false })
    pinsMapping: PinsMapping;

    @jsonMember(Pins)
    pins: Pins;

    @jsonMember(Circuit, { isRequired: false })
    circuit: Circuit;

    @jsonArrayMember(Boolean, { dimensions: 2, isRequired: false })
    truthTable: boolean[][];

    @jsonMember(String,{isRequired:false})
    booleanFunction: string;

    @jsonMember(ComponentDefinitionMetadata)
    metadata: ComponentDefinitionMetadata;

}
