import type { ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import { assert, getRandomInt } from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";
import _ from 'lodash';

export class MockComponentDefinitonLoaderService implements ComponentDefinitionLoaderService {

    private definitionsBehaviourSubject: BehaviorSubject<Map<number, ComponentDefinition>> = new BehaviorSubject<Map<number, ComponentDefinition>>(new Map());

    async loadDefinitions(user: User): Promise<Map<number, ComponentDefinition>> {
        const allDefs = this.loadBuiltinDefinitions();
        const userDefs = this.loadUserDefinitions();
        for (const def of userDefs.values()) {
            allDefs.set(def.id, def);
        }
        this.definitionsBehaviourSubject.next(allDefs);
        return this.definitionsBehaviourSubject.getValue();
    }

    init() {
        this.loadDefinitions(null);
    }

    dispose() {
    }

    loadBuiltinDefinitions(): Map<number, ComponentDefinition> {
        const builtins: Map<number, ComponentDefinition> = new Map<number, ComponentDefinition>();
        for (const definition of BUILTIN_DEFINITIONS) {
            builtins.set(definition.id, definition);
        }

        return builtins;
    }

    loadUserDefinitions(): Map<number, ComponentDefinition> {
        let defs = new Map();
        const defsJson = localStorage.getItem('userDefinitions');
        if (defsJson != null) {
            const parsed: ComponentDefinition[] = JSON.parse(defsJson);
            for (const def of parsed) {
                defs.set(def.id, def);
            }
        }

        return defs;
    }

    async deleteDefinition(id: number): Promise<ComponentDefinition> {
        let defs = this.loadUserDefinitions();
        const map = this.definitionsBehaviourSubject.getValue();
        const item = defs.get(id);
        defs.delete(id);
        map.delete(id);
        localStorage.setItem('userDefinitions', JSON.stringify(Array.from(defs.values())));
        this.definitionsBehaviourSubject.next(map);
        return item;
    }

    async insertDefinition(definition: ComponentDefinition, force: boolean): Promise<void> {
        let defs = this.loadUserDefinitions();
        const id = getRandomInt(0, 2500000);
        const map = this.definitionsBehaviourSubject.getValue();
        definition.id = id;
        defs.set(id, definition);
        map.set(id, definition);
        localStorage.setItem('userDefinitions', JSON.stringify(Array.from(defs.values())));
        this.definitionsBehaviourSubject.next(map);
        return;
    }

    getDefinitionsBehaviourSubject(): BehaviorSubject<Map<number, ComponentDefinition>> {
        return this.definitionsBehaviourSubject;
    }

    getDefinition(id: number): ComponentDefinition {
        const def = this.definitionsBehaviourSubject.getValue().get(id);
        assert(def != undefined, `No definition with id=${id}`);
        return def;

    }

    getDefinitions(ids: number[]): Map<number, ComponentDefinition> {
        const map = new Map();
        for (const id of ids) {
            map.set(id, this.getDefinition(id));
        }
        return map;
    }
}



const NAND_DEFINITION: ComponentDefinition = {
    id: -1,
    name: "NAND Gate",
    type: "Builtin",
    description: "A NAND gate",
    pins: {
        input: ["A", "B"],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "nand_gate.png"
    }
}

const TRISTATE_DEFINITION: ComponentDefinition = {
    id: -2,
    name: "Tristate",
    description: "Tristate component with the capability of not propagating signals",
    type: "Builtin",
    pins: {
        input: ["A", "B"],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "tristate.png"
    }

}

//clock questions
const CLOCK_DEFINITION: ComponentDefinition = {
    id: -3,
    name: "Clock",
    description: "Emits signal repeatedly",
    type: "Builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "clock.png"
    }
}


const GROUND_DEFINITION: ComponentDefinition = {
    id: -4,
    name: "Ground",
    description: "Emits a constant 0",
    type: "Builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "ground.png"
    }
}


const SOURCE_DEFINITION: ComponentDefinition = {
    id: -5,
    name: "Source",
    description: "Emits a constant 1",
    type: "Builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "source.png"
    }
}


const SWITCH_DEFININITION: ComponentDefinition = {
    id: -6,
    name: "Switch",
    description: "User-input component which emits whichever state it is currently on.",
    type: "Builtin",
    pins: {
        input: [],
        output: ["Y"]
    },
    pinMapping: null,
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
        imageUrl: "switch.png"
    }
}


const LED_DEFINITION: ComponentDefinition = {
    id: -7,
    name: "Led",
    description: "Output component which only has a single state.",
    type: "Builtin",
    pins: {
        input: ["Y"],
        output: []
    },
    pinMapping: null,
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
        imageUrl: "led.png"
    }
}

const BUILTIN_DEFINITIONS: ComponentDefinition[] = [
    NAND_DEFINITION,
    TRISTATE_DEFINITION,
    CLOCK_DEFINITION,
    GROUND_DEFINITION,
    SOURCE_DEFINITION,
    SWITCH_DEFININITION,
    LED_DEFINITION,
];
