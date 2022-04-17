import type { Component } from "$lib/models/circuit";
import type { ComponentDefinitionMetadata, ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { Err, Ok, type Result } from "ts-results";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";

export class MockComponentDefinitonLoaderService implements ComponentDefinitionLoaderService {

    private definitionsBehaviourSubject: BehaviorSubject<Map<number, ComponentDefinition>> = new BehaviorSubject<Map<number, ComponentDefinition>>(new Map());
    async loadDefinitions(user: User, offset: number, limit: number): Promise<Result<Map<number, ComponentDefinition>, Error>> {
        this.definitionsBehaviourSubject.next(this.loadBuiltinDefinitions())
        return Ok(this.definitionsBehaviourSubject.getValue());
    }

   
    init() {
        this.loadDefinitions(null, null, null);
    }

    dispose() {
    }

    loadBuiltinDefinitions(): Map<number, ComponentDefinition> {
        const builtins: Map<number, ComponentDefinition> = new Map<number, ComponentDefinition>();
        for (const definition of BUILTIN_DEFINITIONS) {
            let definitionJson = JSON.stringify(definition);
            const definitionCopy = JSON.parse(definitionJson);
            builtins.set(definitionCopy.id, definitionCopy);
        }
        return builtins;
    }

    deleteDefinition(id: number): Promise<Result<ComponentDefinition, Error>> {
        throw new Error("Method not implemented.");
    }


    insertDefinition(definition: ComponentDefinition, force: boolean): Promise<Result<void, Error>> {
        return null;
    }

    getDefinitionsBehaviourSubject(): BehaviorSubject<Map<number, ComponentDefinition>> {
        return this.definitionsBehaviourSubject;
    }

    getDefinition(id: number): Result<ComponentDefinition, Error> {
        const def = this.definitionsBehaviourSubject.getValue().get(id)
        if(def != undefined){
            return Ok(def) 
        }else{
            return Err(new Error(`No definition with id=${id}`));
        }
    }

}



const NAND_DEFINITION: ComponentDefinition = {
    id: -1,
    name: "NAND Gate",
    type: "builtin",
    description: "A NAND gate",
    pins: {
        input: ["A", "B"],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [{ name: "A", pin: 0 }, { name: "B", pin: 1 }],
            right: [{ name: "Y", pin: 2 }]
        },
        imageUrl: `nand_gate.png`
    }
}


const TRISTATE_DEFINITION: ComponentDefinition = {
    id: -2,
    name: "Tristate",
    description: "Tristate component with the capability of not propagating signals",
    type: "builtin",
    pins: {
        input: ["A", "B"],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [{ name: "A", pin: 0 }, { name: "B", pin: 1 }],
            right: [{ name: "Y", pin: 2 }]
        },
        imageUrl: `tristate.png`
    }

}

//clock questions
const CLOCK_DEFINITION: ComponentDefinition = {
    id: -3,
    name: "Clock",
    description: "Emits signal repeatedly",
    type: "builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [],
            right: [{ name: "Y", pin: 0 }]
        },
        imageUrl: `clock.png`
    }
}


const GROUND_DEFINITION: ComponentDefinition = {
    id: -4,
    name: "Ground",
    description: "Emits a constant 0",
    type: "builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [],
            right: [{ name: "Y", pin: 0 }]
        },
        imageUrl: `ground.png`
    }
}


const SOURCE_DEFINITION: ComponentDefinition = {
    id: -5,
    name: "Source",
    description: "Emits a constant 1",
    type: "builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [],
            right: [{ name: "Y", pin: 0 }]
        },
        imageUrl: `source.png`
    }
}


const SWITCH_DEFININITION: ComponentDefinition = {
    id: -6,
    name: "Switch",
    description: "User-input component which emits whichever state it is currently on.",
    type: "builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [],
            right: [{ name: "Y", pin: 0 }]
        },
        imageUrl: `switch.png`
    }
}


const LED_DEFINITION: ComponentDefinition = {
    id: -7,
    name: "Led",
    description: "Output component which only has a single state.",
    type: "builtin",
    pins: {
        input: ["Y"],
        output: []
    },
    pinsMapping: null,
    circuit: null,
    truthTable: null,
    booleanFunction: null,
    metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        pinLocationMapping: {
            top: [],
            bottom: [],
            left: [{ name: "Y", pin: 0 }],
            right: []
        },
        imageUrl: `led.png`
    }
}

const BUILTIN_DEFINITIONS = [NAND_DEFINITION, TRISTATE_DEFINITION, CLOCK_DEFINITION,
    GROUND_DEFINITION, SOURCE_DEFINITION, SWITCH_DEFININITION,
    LED_DEFINITION];