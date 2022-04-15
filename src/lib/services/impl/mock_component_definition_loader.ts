import type { Component } from "$lib/models/circuit";
import type { ComponentDefinitionMetadata, ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { Err, Ok, type Result } from "ts-results";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";

export class MockComponentDefinitonLoaderService implements ComponentDefinitionLoaderService {
   
    private definitionsBehaviourSubject: BehaviorSubject<Map<number,ComponentDefinition>> = new BehaviorSubject<Map<number,ComponentDefinition>>(new Map());
    async loadDefinitions(user: User, offset: number, limit: number): Promise<Result<Map<number, ComponentDefinition>, Error>> {
        this.definitionsBehaviourSubject.next(this.loadBuiltinDefinitions())
        return Ok(this.definitionsBehaviourSubject.getValue());
    }

    constructor(){
        this.loadDefinitions(null,null,null);
    }

    loadBuiltinDefinitions(): Map<number, ComponentDefinition> {
        const builtins: Map<number,ComponentDefinition>  = new Map<number,ComponentDefinition>();
        for(let i = -1000;i<0;i++){
            builtins.set(i,NAND_DEFINITION);
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
        return null;
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
        imageUrl: "/nand_gate.png"
    }
}