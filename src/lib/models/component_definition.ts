import { jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson";
import { Circuit} from "./circuit";
import type { ComponentType } from "./component_type";
import { Connector } from "./connector";

@toJson
@jsonObject
export class PinMapping {
    @jsonArrayMember(Connector, { dimensions: 2 })
    input: Connector[][];

    @jsonArrayMember(Connector, { dimensions: 2 })
    output: Connector[][];

    constructor(input: Connector[][], output: Connector[][]) {
        this.input = input;
        this.output = output;
    }
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

    @jsonMember(String)
    imageUrl: string;

    constructor() {
        this.pinLocationMapping = {
            left: [],
            right: [],
            top: [],
            bottom: [],
        };
        this.createdAt = new Date();
        this.modifiedAt = new Date();
        this.imageUrl = '';
    }
}

@toJson
@jsonObject
export class Pins {
    @jsonArrayMember(String)
    input: string[];

    @jsonArrayMember(String)
    output: string[]

    constructor(input: string[], output: string[]) {
        this.input = input;
        this.output = output;
    }
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

    @jsonMember(PinMapping, { isRequired: false })
    pinMapping: PinMapping;

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

    constructor() {
        this.id = 0;
        this.name = '';
        this.type = 'Transparent';
        this.description = '';
        this.pinMapping = null;
        this.pins = new Pins([], []);
        this.circuit = null;
        this.truthTable = null;
        this.booleanFunction = null;
        this.metadata = new ComponentDefinitionMetadata();
    }
}
