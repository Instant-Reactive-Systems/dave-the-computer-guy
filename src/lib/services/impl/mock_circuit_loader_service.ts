import type { Circuit } from "$lib/models/circuit";
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";
import type { CircuitLoaderService } from "../circuit_loader_service";
import type {Connection } from "$lib/models/connection"
import type { AuthService } from "../auth_service";
import { HtmlTagHydration } from "svelte/internal";

export class MockCircuitLoaderService implements CircuitLoaderService{
    
    init() {}

    dispose() {}

    loadUserCircuits(user: User, offset: number, limit: number): Promise<Circuit[]> {
        throw new Error("Method not implemented.");
    }

    insertCircuit(circuit: Circuit, force: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deleteCircuit(circuitId: number): Promise<Circuit> {
        throw new Error("Method not implemented.");
    }

    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]> {
        throw new Error("Method not implemented.");
    }

}
