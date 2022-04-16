import type { Circuit } from "$lib/models/circuit";
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";
import type { Result } from "ts-results";
import type { CircuitLoaderService } from "../circuit_loader_service";
import type {Connection } from "$lib/models/connection"
import type { AuthService } from "../auth_service";
import { HtmlTagHydration } from "svelte/internal";

export class MockCircuitLoaderService implements CircuitLoaderService{
    init() {
    }
    dispose() {
    }

    loadUserCircuits(user: User, offset: number, limit: number): Promise<Result<Circuit[], Error>> {
        throw new Error("Method not implemented.");
    }
    insertCircuit(circuit: Circuit, force: boolean): Promise<Result<void, Error>> {
        throw new Error("Method not implemented.");
    }
    deleteCircuit(circuitId: number): Promise<Result<Circuit, Error>> {
        throw new Error("Method not implemented.");
    }
    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]> {
        throw new Error("Method not implemented.");
    }

    
   
   
    
}

const NAND_GATE_CIRCUIT_JSON = {
    "id": 0,
    "name": "Nand gate circuit",
    "description": "w/e",
    "components": [
        {
            "definitionId": 1,
            "id": 0
        },
        {
            "definitionId": 2,
            "id": 1
        }
    ],
    "connections": [
        {
            "from": {
                "componentId": 0,
                "pin": 2
            },
            "to": [
                {
                    "componentId": 1,
                    "pin": 0
                }
            ]
        }
    ],
    "metadata": {

    },
    "params": []

}
